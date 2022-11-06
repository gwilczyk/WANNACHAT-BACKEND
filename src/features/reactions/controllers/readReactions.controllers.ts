import { IReactionDocument } from '@reactions/interfaces/reactions.interfaces';
import { reactionsServices } from '@services/db/reactions.services';
import { ReactionsCache } from '@services/redis/reactions.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

const reactionsCache: ReactionsCache = new ReactionsCache();

export class Read {
  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedReactions: [IReactionDocument[], number] = await reactionsCache.getPostReactionsFromCache(postId);
    const reactions: [IReactionDocument[], number] = cachedReactions[0].length
      ? /* Reactions fetched from Redis cache_ */
        cachedReactions
      : /* …else from MongoDB */
        await reactionsServices.getPostReactionsFromDB({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  }

  public async userReaction(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params;
    const cachedUserReaction: [IReactionDocument, number] | [] = await reactionsCache.getUserPostReactionFromCache(postId, username);
    const reaction: [IReactionDocument, number] | [] = cachedUserReaction.length
      ? /* Reactions fetched from Redis cache_ */
        cachedUserReaction
      : /* …else from MongoDB */
        await reactionsServices.getUserPostReactionFromDB(postId, username);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'User post reaction', reactions: reaction.length ? reaction[0] : {}, count: reaction.length ? reaction[1] : 0 });
  }

  public async userReactions(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const reactions: IReactionDocument[] = await reactionsServices.getUserReactionsFromDB(username);

    res.status(HTTP_STATUS.OK).json({ message: 'User reactions', reactions });
  }
}
