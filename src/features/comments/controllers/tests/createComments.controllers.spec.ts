import { Create } from '@comments/controllers/createComments.controllers';
import { authUserPayload } from '@mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { existingUser } from '@mocks/user.mock';
import { commentsQueue } from '@services/queues/comments.queue';
import { CommentsCache } from '@services/redis/comments.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/comments.cache');

describe('Create', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should call savePostCommentToCache and addCommentJob methods', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();
    jest.spyOn(CommentsCache.prototype, 'savePostCommentToCache');
    jest.spyOn(commentsQueue, 'addCommentJob');

    await Create.prototype.comment(req, res);

    expect(CommentsCache.prototype.savePostCommentToCache).toHaveBeenCalled();
    expect(commentsQueue.addCommentJob).toHaveBeenCalled();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();

    await Create.prototype.comment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post comment created successfully'
    });
  });
});
