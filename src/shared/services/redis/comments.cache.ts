import { ICommentDocument, ICommentNameList } from '@comments/interfaces/comments.interfaces';
import { ServerError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { find } from 'lodash';

const log: Logger = config.createLogger('commentsCache');

export class CommentsCache extends BaseCache {
  constructor() {
    super('commentsCache');
  }

  public async getPostCommentFromCache(postId: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCommentsInCache: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);

      const postCommentsList: ICommentDocument[] = [];
      for (const postComment of postCommentsInCache) {
        postCommentsList.push(Helpers.parseJson(postComment));
      }

      const postComment: ICommentDocument = find(postCommentsList, (item: ICommentDocument) => item._id === commentId) as ICommentDocument;
      return [postComment];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostCommentsFromCache(postId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCommentsInCache: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);

      const postCommentsList: ICommentDocument[] = [];
      for (const postComment of postCommentsInCache) {
        postCommentsList.push(Helpers.parseJson(postComment));
      }

      return postCommentsList;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostCommentsUsernamesFromCache(postId: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCommentsCount: number = await this.client.LLEN(`comments:${postId}`);
      const postComments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);

      const postCommentsUsernamesList: string[] = [];
      for (const postComment of postComments) {
        const parsedPostComment: ICommentDocument = Helpers.parseJson(postComment) as ICommentDocument;
        postCommentsUsernamesList.push(parsedPostComment.username);
      }

      const response: ICommentNameList = { count: postCommentsCount, names: postCommentsUsernamesList };
      return [response];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async savePostCommentToCache(postId: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LPUSH(`comments:${postId}`, value);

      const commentsCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      const incrementedCommentsCount: number = parseInt(Helpers.parseJson(commentsCount[0]), 10) + 1;
      await this.client.HSET(`posts:${postId}`, ['commentsCount', incrementedCommentsCount]);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
