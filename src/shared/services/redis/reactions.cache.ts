import { ServerError } from '@globals/helpers/error-handler';
import { ISavePostReactionToCache } from '@reactions/interfaces/reactions.interfaces';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('reactionsCache');

export class ReactionsCache extends BaseCache {
  constructor() {
    super('reactionsCache');
  }

  public async savePostReactionToCache(data: ISavePostReactionToCache): Promise<void> {
    const { postId, postReactions, previousReaction, reaction, type } = data;
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        /* call remove reaction method */
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
