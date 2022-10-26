import { IResetPasswordParams } from '@user/interfaces/user.interfaces';
import ejs from 'ejs';
import fs from 'fs';

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date } = templateParams;

    return ejs.render(fs.readFileSync(__dirname + '/resetPasswordTemplate.ejs', 'utf-8'), {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
