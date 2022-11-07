import { Read } from '@comments/controllers/readComments.controllers';
import { authUserPayload } from '@mocks/auth.mock';
import { commentNames, commentsData, reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { commentsServices } from '@services/db/comments.services';
import { CommentsCache } from '@services/redis/comments.cache';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/comments.cache');

describe('Read', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('comments', () => {
    it('should send correct json response if comments exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([commentsData]);

      await Read.prototype.comments(req, res);

      expect(CommentsCache.prototype.getPostCommentsFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });

    it('should send correct json response if comments exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentsFromCache').mockResolvedValue([]);
      jest.spyOn(commentsServices, 'getPostCommentsFromDB').mockResolvedValue([commentsData]);

      await Read.prototype.comments(req, res);

      expect(commentsServices.getPostCommentsFromDB).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments',
        comments: [commentsData]
      });
    });
  });

  describe('commentsUsernames', () => {
    it('should send correct json response if data exist in cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentsUsernamesFromCache').mockResolvedValue([commentNames]);

      await Read.prototype.commentsUsernames(req, res);

      expect(CommentsCache.prototype.getPostCommentsUsernamesFromCache).toHaveBeenCalledWith('6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments usernames',
        comments: [commentNames]
      });
    });

    it('should send correct json response if data exist in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentsUsernamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentsServices, 'getPostCommentsUsernamesFromDB').mockResolvedValue([commentNames]);

      await Read.prototype.commentsUsernames(req, res);

      expect(commentsServices.getPostCommentsUsernamesFromDB).toHaveBeenCalledWith(
        { postId: new mongoose.Types.ObjectId('6027f77087c9d9ccb1555268') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments usernames',
        comments: [commentNames]
      });
    });

    it('should return empty comments if data does not exist in cache nor in database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentsUsernamesFromCache').mockResolvedValue([]);
      jest.spyOn(commentsServices, 'getPostCommentsUsernamesFromDB').mockResolvedValue([]);

      await Read.prototype.commentsUsernames(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comments usernames',
        comments: []
      });
    });
  });

  describe('comment', () => {
    it('should send correct json response from cache', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentFromCache').mockResolvedValue([commentsData]);

      await Read.prototype.comment(req, res);

      expect(CommentsCache.prototype.getPostCommentFromCache).toHaveBeenCalledWith('6064861bc25eaa5a5d2f9bf4', '6027f77087c9d9ccb1555268');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comment',
        comments: commentsData
      });
    });

    it('should send correct json response from database', async () => {
      const req: Request = reactionMockRequest({}, {}, authUserPayload, {
        commentId: '6064861bc25eaa5a5d2f9bf4',
        postId: '6027f77087c9d9ccb1555268'
      }) as Request;
      const res: Response = reactionMockResponse();
      jest.spyOn(CommentsCache.prototype, 'getPostCommentFromCache').mockResolvedValue([]);
      jest.spyOn(commentsServices, 'getPostCommentsFromDB').mockResolvedValue([commentsData]);

      await Read.prototype.comment(req, res);

      expect(commentsServices.getPostCommentsFromDB).toHaveBeenCalledWith(
        { _id: new mongoose.Types.ObjectId('6064861bc25eaa5a5d2f9bf4') },
        { createdAt: -1 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post comment',
        comments: commentsData
      });
    });
  });
});
