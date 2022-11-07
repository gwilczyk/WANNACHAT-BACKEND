import { ICommentDocument, ICommentNameList } from '@comments/interfaces/comments.interfaces';
import { commentsServices } from '@services/db/comments.services';
import { CommentsCache } from '@services/redis/comments.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

const commentsCache: CommentsCache = new CommentsCache();

export class Read {
  public async comment(req: Request, res: Response): Promise<void> {
    const { commentId, postId } = req.params;

    const cachedComment: ICommentDocument[] = await commentsCache.getPostCommentFromCache(commentId, postId);
    const comment: ICommentDocument[] = cachedComment.length
      ? /* Comments fetched from Redis cache_ */
        cachedComment
      : /* …else from MongoDB */
        await commentsServices.getPostCommentsFromDB({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comment', comments: comment[0] });
  }

  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    const cachedComments: ICommentDocument[] = await commentsCache.getPostCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComments.length
      ? /* Comments fetched from Redis cache_ */
        cachedComments
      : /* …else from MongoDB */
        await commentsServices.getPostCommentsFromDB({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
  }

  public async commentsUsernames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    const cachedCommentsUsernames: ICommentNameList[] = await commentsCache.getPostCommentsUsernamesFromCache(postId);
    const commentsUsernames: ICommentNameList[] = cachedCommentsUsernames.length
      ? /* Comments fetched from Redis cache_ */
        cachedCommentsUsernames
      : /* …else from MongoDB */
        await commentsServices.getPostCommentsUsernamesFromDB({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post comments usernames', comments: commentsUsernames });
  }
}
