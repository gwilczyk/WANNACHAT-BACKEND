import { IAuthDocument, ISignupData } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schemes/signup.scheme';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { uploads } from '@globals/helpers/cloudinary-upload';
import { BadRequestError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { authService } from '@services/db/auth.service';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

export class Signup {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body;

    const userExists: IAuthDocument = await authService.getUserByUsernameOrEmail({ username, email });
    if (userExists) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = Signup.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload: an error occurred. Try again.');
    }
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
}
