import { ICommentDocument, ICommentJob } from '@comments/interfaces/comments.interfaces';
import { addCommentSchema } from '@comments/schemes/comments.schemes';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { commentsQueue } from '@services/queues/comments.queue';
import { CommentsCache } from '@services/redis/comments.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

const commentsCache: CommentsCache = new CommentsCache();

export class Create {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { comment, postId, profilePicture, userTo } = req.body;
    const commentId = new ObjectId();

    const commentForCache: ICommentDocument = {
      _id: commentId,
      avatarColor: req.currentUser!.avatarColor,
      comment,
      createdAt: new Date(),
      postId,
      profilePicture,
      username: req.currentUser!.username,
      userTo
    } as ICommentDocument;
    await commentsCache.savePostCommentToCache(postId, JSON.stringify(commentForCache));

    const commentForDB: ICommentJob = {
      comment: commentForCache,
      postId,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      userTo
    };
    commentsQueue.addCommentJob('addCommentToDB', commentForDB);

    res.status(HTTP_STATUS.OK).json({ message: 'Post comment created successfully' });
  }
}
