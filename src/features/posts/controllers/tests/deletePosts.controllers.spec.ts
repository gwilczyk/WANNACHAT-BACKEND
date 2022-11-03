import { authUserPayload } from '@mocks/auth.mock';
import { newPost, postMockRequest, postMockResponse } from '@mocks/posts.mock';
import { Delete } from '@posts/controllers/deletePosts.controllers';
import { postsQueue } from '@services/queues/posts.queue';
import { PostsCache } from '@services/redis/posts.cache';
import * as postsServer from '@sockets/posts.sockets';
import { Request, Response } from 'express';
import { Server } from 'socket.io';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/posts.cache');

Object.defineProperties(postsServer, {
  socketIOPostsObject: {
    value: new Server(),
    writable: true
  }
});

describe('Delete', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = postMockRequest(newPost, authUserPayload, { postId: '12345' }) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(postsServer.socketIOPostsObject, 'emit');
    jest.spyOn(PostsCache.prototype, 'deletePostFromCache');
    jest.spyOn(postsQueue, 'addPostJob');

    await Delete.prototype.post(req, res);
    expect(postsServer.socketIOPostsObject.emit).toHaveBeenCalledWith('delete post', req.params.postId);
    expect(PostsCache.prototype.deletePostFromCache).toHaveBeenCalledWith(req.params.postId, `${req.currentUser?.userId}`);
    expect(postsQueue.addPostJob).toHaveBeenCalledWith('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser?.userId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post deleted successfully'
    });
  });
});
