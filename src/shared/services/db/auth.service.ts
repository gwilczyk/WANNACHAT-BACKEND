import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.model';
import { Helpers } from '@globals/helpers/helpers';

class AuthService {
  public async getUserByUsernameOrEmail({ username, email }: { username: string; email: string }): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.capitalizeFirstLetter(username) }, { email: email.toLowerCase() }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
