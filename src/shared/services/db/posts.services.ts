import { IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDeleted } from '@posts/interfaces/posts.interfaces';
import { PostModel } from '@posts/models/posts.model';
import { IUserDocument } from '@user/interfaces/user.interfaces';
import { UserModel } from '@user/models/user.model';
import { Query, UpdateQuery } from 'mongoose';

class PostsServices {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });

    await Promise.all([post, user]);
  }

  public async deletePostFromDB(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
    /* TODO: Delete comments here */
    /* TODO: Delete reactions here */
    const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });

    await Promise.all([deletePost, decrementPostCount]);
  }

  public async getPostsFromDB(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
    } else {
      postQuery = query;
    }
    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
    return posts;
  }

  public async postsCountInDB(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }

  public async updatePostInDB(postId: string, updatedPost: IPostDocument): Promise<void> {
    const postUpdated: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
    await Promise.all([postUpdated]);
  }
}

export const postsServices: PostsServices = new PostsServices();
