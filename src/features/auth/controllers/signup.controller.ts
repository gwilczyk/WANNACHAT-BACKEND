import { IAuthDocument, ISignupData } from '@auth/interfaces/auth.interfaces';
import { signupSchema } from '@auth/schemes/signup.scheme';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { uploads } from '@globals/helpers/cloudinary-upload';
import { BadRequestError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { config } from '@root/config';
import { authService } from '@services/db/auth.service';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interfaces';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { omit } from 'lodash';
import { ObjectId } from 'mongodb';

const userCache: UserCache = new UserCache();

export class Signup {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body;

    const userExists: IAuthDocument = await authService.getAuthUserByUsernameOrEmail({ username, email });
    if (userExists) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = Signup.prototype.signupData({
      _id: authObjectId,
      avatarColor,
      email,
      password,
      uId,
      username
    });

    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload: an error occurred. Try again.');
    }

    /* Add user to Redis cache */
    const userDataForCache: IUserDocument = Signup.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    /* Add user to database */
    const userWithOmission = omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob({ name: 'addUserToDB', data: { value: userWithOmission } });

    const userJwt: string = Signup.prototype.signToken(authData, userObjectId);
    req.session = { jwt: userJwt };

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
  }

  private signupData(data: ISignupData): IAuthDocument {
    const { _id, uId, username, email, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.capitalizeFirstLetter(username),
      email: email.toLowerCase(),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;

    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.capitalizeFirstLetter(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
