import { Helpers } from '@globals/helpers/helpers';
import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { PostModel } from '@posts/models/posts.model';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@reactions/interfaces/reactions.interfaces';
import { ReactionModel } from '@reactions/models/reactions.model';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interfaces';
import { omit } from 'lodash';
import mongoose from 'mongoose';

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

  public async getPostReactionsFromDB(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);

    return [reactions, reactions.length];
  }

  public async getUserPostReactionFromDB(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.capitalizeFirstLetter(username) } }
    ]);

    return reactions.length ? [reactions[0], 1] : [];
  }

  /* getUserReactions is not implemented in Redis cache methods --- only fetching this information from MongoDB */
  public async getUserReactionsFromDB(username: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { username: Helpers.capitalizeFirstLetter(username) } }
    ]);

    return reactions;
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
