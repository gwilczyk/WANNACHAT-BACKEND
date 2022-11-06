import { authUserPayload } from '@mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { Delete } from '@reactions/controllers/deleteReactions.controllers';
import { reactionsQueue } from '@services/queues/reactions.queue';
import { ReactionsCache } from '@services/redis/reactions.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/reactions.cache');

describe('Delete reaction', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest({}, {}, authUserPayload, {
      postId: '6027f77087c9d9ccb1555268',
      previousReaction: 'like',
      postReactions: JSON.stringify({
        like: 1,
        love: 0,
        happy: 0,
        wow: 0,
        sad: 0,
        angry: 0
      })
    }) as Request;
    const res: Response = reactionMockResponse();

    jest.spyOn(ReactionsCache.prototype, 'removePostReactionFromCache');
    const spy = jest.spyOn(reactionsQueue, 'addReactionJob');

    await Delete.prototype.reaction(req, res);

    expect(ReactionsCache.prototype.removePostReactionFromCache).toHaveBeenCalledWith({
      postId: '6027f77087c9d9ccb1555268',
      postReactions: JSON.parse(req.params.postReactions),
      username: `${req.currentUser?.username}`
    });
    expect(reactionsQueue.addReactionJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reaction removed from post successfully'
    });
  });
});
