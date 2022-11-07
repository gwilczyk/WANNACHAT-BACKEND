import { IReactionJob } from '@reactions/interfaces/reactions.interfaces';
import { reactionsQueue } from '@services/queues/reactions.queue';
import { ReactionsCache } from '@services/redis/reactions.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const reactionsCache: ReactionsCache = new ReactionsCache();

export class Delete {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, postReactions, previousReaction } = req.params;
    const reactionDataForDB: IReactionJob = {
      postId,
      previousReaction,
      username: req.currentUser!.username
    };

    await reactionsCache.removePostReactionFromCache({
      postId,
      postReactions: JSON.parse(postReactions),
      username: req.currentUser!.username
    });

    reactionsQueue.addReactionJob('removeReactionFromDB', reactionDataForDB);

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post successfully' });
  }
}
