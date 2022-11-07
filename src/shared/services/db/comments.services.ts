import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comments/interfaces/comments.interfaces';
import { CommentsModel } from '@comments/models/comments.model';
import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { PostModel } from '@posts/models/posts.model';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interfaces';
import { Query } from 'mongoose';

const userCache: UserCache = new UserCache();

class CommentsServices {
  public async addPostCommentToDB(commentToAdd: ICommentJob): Promise<void> {
    const { comment, postId, userFrom, username, userTo } = commentToAdd;

    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;

    const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

    /* TODO: Send comments notification (if enabled by user) */
  }

  public async getPostCommentsFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const postComments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);

    return postComments;
  }

  public async getPostCommentsUsernamesFromDB(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    const postCommentsUsernamesList: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, count: { $sum: 1 }, names: { $addToSet: '$username' } } },
      { $project: { _id: 0 } }
    ]);

    return postCommentsUsernamesList;
  }
}

export const commentsServices: CommentsServices = new CommentsServices();
