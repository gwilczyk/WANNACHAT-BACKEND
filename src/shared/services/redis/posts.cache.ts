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

  public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postsCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const decrementedPostCount: number = parseInt(postsCount[0], 10) - 1;

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);
      multi.HSET(`users:${currentUserId}`, ['postsCount', decrementedPostCount]);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
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

      const postsReply: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

        postsReply.push(post);
      }

      return postsReply;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsNumberInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsWithImageFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
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

      const postsWithImageReply: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
          post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

          postsWithImageReply.push(post);
        }
      }

      return postsWithImageReply;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, uId, uId, { BY: 'SCORE', REV: true });

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostsCacheMultiType = (await multi.exec()) as PostsCacheMultiType;

      const postsReply: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;

        postsReply.push(post);
      }

      return postsReply;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserPostsNumberInCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCOUNT('post', uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { createdPost, currentUserId, key, uId } = data;
    const {
      _id,
      avatarColor,
      bgColor,
      commentsCount,
      createdAt,
      email,
      feelings,
      gifUrl,
      imgId,
      imgVersion,
      post,
      privacy,
      profilePicture,
      reactions,
      userId,
      username
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
      'createdAt',
      `${createdAt}`,
      'imgId',
      `${imgId}`,
      'imgVersion',
      `${imgVersion}`,
      'reactions',
      JSON.stringify(reactions)
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
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updatePostInCache(postId: string, updatedPost: IPostDocument): Promise<IPostDocument> {
    const { bgColor, feelings, gifUrl, imgId, imgVersion, post, privacy, profilePicture } = updatedPost;

    const dataToSave: string[] = [
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'gifUrl',
      `${gifUrl}`,
      'imgId',
      `${imgId}`,
      'imgVersion',
      `${imgVersion}`,
      'post',
      `${post}`,
      'privacy',
      `${privacy}`,
      'profilePicture',
      `${profilePicture}`
    ];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.HSET(`posts:${postId}`, dataToSave);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`posts:${postId}`);
      const reply: PostsCacheMultiType = (await multi.exec()) as PostsCacheMultiType;
      const postReply = reply as IPostDocument[];
      postReply[0].commentsCount = Helpers.parseJson(`${postReply[0].commentsCount}`) as number;
      postReply[0].reactions = Helpers.parseJson(`${postReply[0].reactions}`) as IReactions;
      postReply[0].createdAt = new Date(Helpers.parseJson(`${postReply[0].createdAt}`)) as Date;

      return postReply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
