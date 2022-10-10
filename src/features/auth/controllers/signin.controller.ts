import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { signinSchema } from '@auth/schemes/signin.scheme';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { BadRequestError } from '@globals/helpers/error-handler';
import { config } from '@root/config';
import { authService } from '@services/db/auth.service';
import { userService } from '@services/db/user.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { IUserDocument } from './../../user/interfaces/user.interface';

export class Signin {
  @joiValidation(signinSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };

    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingUser, token: userJwt });
  }
}
