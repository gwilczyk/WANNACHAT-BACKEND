import { ServerError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { IReactionDocument, IRemovePostReactionFromCache, ISavePostReactionToCache } from '@reactions/interfaces/reactions.interfaces';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { find } from 'lodash';

const log: Logger = config.createLogger('reactionsCache');

export class ReactionsCache extends BaseCache {
  constructor() {
    super('reactionsCache');
  }

  public async getPostReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postReactionsCount: number = await this.client.LLEN(`reactions:${postId}`);
      const postReactionsInCache: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      const postReactionsList: IReactionDocument[] = [];
      for (const postReaction of postReactionsInCache) {
        postReactionsList.push(Helpers.parseJson(postReaction));
      }

      return postReactionsInCache.length ? [postReactionsList, postReactionsCount] : [[], 0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  private getPreviousReaction(response: string[], username: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      list.push(Helpers.parseJson(item) as IReactionDocument);
    }
    return find(list, (listItem: IReactionDocument) => listItem.username === username);
  }

  public async getUserPostReactionFromCache(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postReactionsInCache: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      const postReactionsList: IReactionDocument[] = [];
      for (const postReaction of postReactionsInCache) {
        postReactionsList.push(Helpers.parseJson(postReaction));
      }

      const result: IReactionDocument = find(
        postReactionsList,
        (listItem: IReactionDocument) => listItem?.postId === postId && listItem?.username === username
      ) as IReactionDocument;

      return result ? [result, 1] : [];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removePostReactionFromCache(data: IRemovePostReactionFromCache): Promise<void> {
    const { postId, postReactions, username } = data;
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(response, username) as IReactionDocument;
      multi.LREM(`reactions:${postId}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();

      const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
      await this.client.HSET(`posts:${postId}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async savePostReactionToCache(data: ISavePostReactionToCache): Promise<void> {
    const { postId, postReactions, previousReaction, reaction, type } = data;
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        this.removePostReactionFromCache({ postId, postReactions, username: reaction.username });
      }

      if (type) {
        await this.client.LPUSH(`reactions:${postId}`, JSON.stringify(reaction));
        const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
        await this.client.HSET(`posts:${postId}`, dataToSave);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
