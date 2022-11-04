import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { PostModel } from '@posts/models/posts.model';
import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reactions.interfaces';
import { ReactionModel } from '@reactions/models/reactions.model';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interfaces';
import { omit } from 'lodash';

const userCache: UserCache = new UserCache();

class ReactionsServices {
  public async addReactionToDB(reaction: IReactionJob): Promise<void> {
    const { postId, previousReaction, reactionObject, type, userFrom, username, userTo } = reaction;

    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
    if (previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }
    const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];

    /* TODO: Send reactions notifications (if enabled by user) */
  }

  public async removeReactionFromDB(reaction: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reaction;

    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ]);
  }
}

export const reactionsServices: ReactionsServices = new ReactionsServices();
