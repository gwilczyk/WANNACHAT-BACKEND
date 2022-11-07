import { authUserPayload } from '@mocks/auth.mock';
import { postMockData } from '@mocks/posts.mock';
import { reactionData, reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { Read } from '@reactions/controllers/readReactions.controllers';
import { reactionsServices } from '@services/db/reactions.services';
import { ReactionsCache } from '@services/redis/reactions.cache';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/reactions.cache');

describe('Read', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('post reactions', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionsCache.prototype, 'getPostReactionsFromCache').mockResolvedValue([[reactionData], 1]);

      await Read.prototype.reactions(req, res);

      expect(ReactionsCache.prototype.getPostReactionsFromCache).toHaveBeenCalledWith(`${postMockData._id}`);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionsCache.prototype, 'getPostReactionsFromCache').mockResolvedValue([[], 0]);
      jest.spyOn(reactionsServices, 'getPostReactionsFromDB').mockResolvedValue([[reactionData], 1]);

      await Read.prototype.reactions(req, res);

      expect(reactionsServices.getPostReactionsFromDB).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId(`${postMockData._id}`) },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [reactionData],
        count: 1
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionsCache.prototype, 'getPostReactionsFromCache').mockResolvedValue([[], 0]);
      jest.spyOn(reactionsServices, 'getPostReactionsFromDB').mockResolvedValue([[], 0]);

      await Read.prototype.reactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post reactions',
        reactions: [],
        count: 0
      });
    });
  });

  describe('user post reaction', () => {
    it('should send correct json response if reactions exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionsCache.prototype, 'getUserPostReactionFromCache').mockResolvedValue([reactionData, 1]);

      await Read.prototype.userReaction(req, res);

      expect(ReactionsCache.prototype.getUserPostReactionFromCache).toHaveBeenCalledWith(`${postMockData._id}`, postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User post reaction',
        reactions: reactionData,
        count: 1
      });
    });

    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionsCache.prototype, 'getUserPostReactionFromCache').mockResolvedValue([]);
      jest.spyOn(reactionsServices, 'getUserPostReactionFromDB').mockResolvedValue([reactionData, 1]);

      await Read.prototype.userReaction(req, res);

      expect(reactionsServices.getUserPostReactionFromDB).toHaveBeenCalledWith(`${postMockData._id}`, postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User post reaction',
        reactions: reactionData,
        count: 1
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: `${postMockData._id}`,
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(ReactionsCache.prototype, 'getUserPostReactionFromCache').mockResolvedValue([]);
      jest.spyOn(reactionsServices, 'getUserPostReactionFromDB').mockResolvedValue([]);

      await Read.prototype.userReaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User post reaction',
        reactions: {},
        count: 0
      });
    });
  });

  describe('user posts reactions', () => {
    it('should send correct json response if reactions exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionsServices, 'getUserReactionsFromDB').mockResolvedValue([reactionData]);

      await Read.prototype.userReactions(req, res);

      expect(reactionsServices.getUserReactionsFromDB).toHaveBeenCalledWith(postMockData.username);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User reactions',
        reactions: [reactionData]
      });
    });

    it('should send correct json response if reactions list is empty', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        username: postMockData.username
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(reactionsServices, 'getUserReactionsFromDB').mockResolvedValue([]);

      await Read.prototype.userReactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User reactions',
        reactions: []
      });
    });
  });
});
