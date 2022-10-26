import { IAuthDocument } from '@auth/interfaces/auth.interfaces';
import { signinSchema } from '@auth/schemes/signin.scheme';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { BadRequestError } from '@globals/helpers/error-handler';
import { config } from '@root/config';
import { authService } from '@services/db/auth.service';
import { userService } from '@services/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interfaces';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';

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

    // const templateParams: IResetPasswordParams = {
    //   username: existingUser.username!,
    //   email: existingUser.email!,
    //   ipaddress: publicIp.address(),
    //   date: moment().format('DD/MM/YYYY HH:mm')
    // };
    // const resetLink = `${config.CLIENT_URL}/reset-password?token=1237123789789`;
    // const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob('forgotPasswordEmail', {
    //   template,
    //   receiverEmail: 'damian.mraz@ethereal.email',
    //   subject: 'Password reset confirmation'
    // });

    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token: userJwt });
  }
}
