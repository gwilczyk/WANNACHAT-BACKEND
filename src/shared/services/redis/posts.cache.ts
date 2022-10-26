import { ServerError } from '@globals/helpers/error-handler';
import { ISavePostToCache } from '@posts/interfaces/posts.interfaces';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postsCache');

export class PostsCache extends BaseCache {
  constructor() {
    super('postsCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { createdPost, currentUserId, key, uId } = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      commentsCount,
      imgVersion,
      imgId,
      createdAt,
      reactions
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'avatarColor',
      `${avatarColor}`,
      'bgColor',
      `${bgColor}`,
      'email',
      `${email}`,
      'feelings',
      `${feelings}`,
      'gifUrl',
      `${gifUrl}`,
      'post',
      `${post}`,
      'privacy',
      `${privacy}`,
      'profilePicture',
      `${profilePicture}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`
    ];
    const secondList: string[] = [
      'commentsCount',
      `${commentsCount}`,
      'reactions',
      JSON.stringify(reactions),
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'createdAt',
      `${createdAt}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postsCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const incrementedPostCount: number = parseInt(postsCount[0], 10) + 1;

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      multi.HSET(`posts:${key}`, dataToSave);
      multi.HSET(`users:${currentUserId}`, ['postsCount', incrementedPostCount]);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
