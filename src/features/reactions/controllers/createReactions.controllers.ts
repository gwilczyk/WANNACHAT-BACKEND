import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reactions.interfaces';
import { addReactionSchema } from '@reactions/schemes/reactions.schemes';
import { reactionsQueue } from '@services/queues/reactions.queue';
import { ReactionsCache } from '@services/redis/reactions.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

const reactionsCache: ReactionsCache = new ReactionsCache();

export class Create {
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, postReactions, previousReaction, profilePicture, type, userTo } = req.body;

    const reaction: IReactionDocument = {
      _id: new ObjectId(),
      avatarColor: req.currentUser!.avatarColor,
      postId,
      profilePicture,
      type,
      username: req.currentUser!.username
    } as unknown as IReactionDocument;

    await reactionsCache.savePostReactionToCache({ postId, postReactions, previousReaction, reaction, type });

    const reactionDataForDB: IReactionJob = {
      postId,
      previousReaction,
      reactionObject: reaction,
      type,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      userTo
    };
    reactionsQueue.addReactionJob('addReactionToDB', reactionDataForDB);

    res.status(HTTP_STATUS.OK).json({ message: 'Post reaction created successfully' });
  }
}
