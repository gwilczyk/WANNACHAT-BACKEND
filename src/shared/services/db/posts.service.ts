import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { PostModel } from '@posts/models/posts.model';
import { IUserDocument } from '@user/interfaces/user.interfaces';
import { UserModel } from '@user/models/user.model';
import { UpdateQuery } from 'mongoose';

class PostsService {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });

    await Promise.all([post, user]);
  }
}

export const postsService: PostsService = new PostsService();
