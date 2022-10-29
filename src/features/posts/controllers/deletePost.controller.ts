import { postsQueue } from '@services/queues/posts.queue';
import { PostsCache } from '@services/redis/posts.cache';
import { socketIOPostsObject } from '@sockets/posts.sockets';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postsCache: PostsCache = new PostsCache();

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    socketIOPostsObject.emit('delete post', req.params.postId);
    await postsCache.deletePostFromCache(req.params.postId, req.currentUser!.userId);
    postsQueue.addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
