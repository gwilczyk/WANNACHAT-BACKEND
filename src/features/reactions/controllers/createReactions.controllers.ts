import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { IReactionDocument } from '@reactions/interfaces/reactions.interfaces';
import { addReactionSchema } from '@reactions/schemes/reactions.schemes';
import { ReactionsCache } from '@services/redis/reactions.cache';
// import { socketIOPostsObject } from '@sockets/posts.sockets';
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

    // socketIOPostsObject.emit('add post reaction', reaction);

    await reactionsCache.savePostReactionToCache({ postId, postReactions, previousReaction, reaction, type });

    // postsQueue.addPostJob('addPostReactionToDB', { key: req.currentUser!.userId, value: createdPost });

    res.status(HTTP_STATUS.OK).json({ message: 'Post reaction created successfully' });
  }
}
