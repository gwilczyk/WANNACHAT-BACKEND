import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { emailSchema } from '@auth/schemes/password.scheme';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { BadRequestError } from '@globals/helpers/error-handler';
import { config } from '@root/config';
import { authService } from '@services/db/auth.service';
import { forgotPasswordTemplate } from '@services/emails/templates/forgotPassword/forgotPasswordTemplate';
import { emailQueue } from '@services/queues/email.queue';
import crypto from 'crypto';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');

    await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() + 60 * 60 * 1000);

    const resetLink: string = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);

    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }
}
