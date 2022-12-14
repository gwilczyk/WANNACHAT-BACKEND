import { IAuthDocument } from '@auth/interfaces/auth.interfaces';
import { AuthModel } from '@auth/models/auth.model';
import { Helpers } from '@globals/helpers/helpers';

class AuthServices {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsernameOrEmail({ username, email }: { username: string; email: string }): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.capitalizeFirstLetter(username) }, { email: Helpers.lowerCase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne({ _id: authId }, { passwordResetToken: token, passwordResetExpires: tokenExpiration });
  }
}

export const authServices: AuthServices = new AuthServices();
