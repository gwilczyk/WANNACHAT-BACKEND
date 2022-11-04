import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { PostModel } from '@posts/models/posts.model';
import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reactions.interfaces';
import { ReactionModel } from '@reactions/models/reactions.model';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interfaces';

const userCache: UserCache = new UserCache();

class ReactionsServices {
  public async addReactionToDB(reaction: IReactionJob): Promise<void> {
    const { postId, previousReaction, reactionObject, type, userFrom, username, userTo } = reaction;
    const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, reactionObject, { upset: true }),
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
}

export const reactionsServices: ReactionsServices = new ReactionsServices();
