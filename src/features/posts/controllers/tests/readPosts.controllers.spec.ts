import { authUserPayload } from '@mocks/auth.mock';
import { newPost, postMockData, postMockRequest, postMockResponse } from '@mocks/posts.mock';
import { Read } from '@posts/controllers/readPosts.controllers';
import { postsServices } from '@services/db/posts.services';
import { PostsCache } from '@services/redis/posts.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/posts.cache');

describe('Read', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('posts', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostsCache.prototype, 'getPostsFromCache').mockResolvedValue([postMockData]);
      jest.spyOn(PostsCache.prototype, 'getPostsNumberInCache').mockResolvedValue(1);

      await Read.prototype.posts(req, res);
      expect(PostsCache.prototype.getPostsFromCache).toHaveBeenCalledWith('post', 0, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostsCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(PostsCache.prototype, 'getPostsNumberInCache').mockResolvedValue(0);
      jest.spyOn(postsServices, 'getPostsFromDB').mockResolvedValue([postMockData]);
      jest.spyOn(postsServices, 'postsCountInDB').mockResolvedValue(1);

      await Read.prototype.posts(req, res);
      expect(postsServices.getPostsFromDB).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1
      });
    });

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostsCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(PostsCache.prototype, 'getPostsNumberInCache').mockResolvedValue(0);
      jest.spyOn(postsServices, 'getPostsFromDB').mockResolvedValue([]);
      jest.spyOn(postsServices, 'postsCountInDB').mockResolvedValue(0);

      await Read.prototype.posts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [],
        totalPosts: 0
      });
    });
  });

  describe('postsWithImage', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostsCache.prototype, 'getPostsWithImageFromCache').mockResolvedValue([postMockData]);

      await Read.prototype.postsWithImage(req, res);
      expect(PostsCache.prototype.getPostsWithImageFromCache).toHaveBeenCalledWith('post', 0, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with image',
        posts: [postMockData]
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostsCache.prototype, 'getPostsWithImageFromCache').mockResolvedValue([]);
      jest.spyOn(postsServices, 'getPostsFromDB').mockResolvedValue([postMockData]);

      await Read.prototype.postsWithImage(req, res);
      expect(postsServices.getPostsFromDB).toHaveBeenCalledWith({ imgId: '$ne', gifUrl: '$ne' }, 0, 10, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with image',
        posts: [postMockData]
      });
    });

    it('should send empty posts', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload, { page: '1' }) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(PostsCache.prototype, 'getPostsWithImageFromCache').mockResolvedValue([]);
      jest.spyOn(postsServices, 'getPostsFromDB').mockResolvedValue([]);

      await Read.prototype.postsWithImage(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts with image',
        posts: []
      });
    });
  });
});
