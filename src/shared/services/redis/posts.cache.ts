import { ServerError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { IPostDocument, ISavePostToCache } from '@posts/interfaces/posts.interfaces';
import { IReactions } from '@reactions/interfaces/reactions.interfaces';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postsCache');

export type PostsCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];

export class PostsCache extends BaseCache {
  constructor() {
    super('postsCache');
  }

  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostsCacheMultiType = (await multi.exec()) as PostsCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

        postReplies.push(post);
      }

      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
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
