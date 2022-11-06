import { authUserPayload } from '@mocks/auth.mock';
import { reactionMockRequest, reactionMockResponse } from '@mocks/reactions.mock';
import { Create } from '@reactions/controllers/createReactions.controllers';
import { reactionsQueue } from '@services/queues/reactions.queue';
import { ReactionsCache } from '@services/redis/reactions.cache';
import { Request, Response } from 'express';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/reactions.cache');

describe('Create reaction', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        postReactions: {
          like: 1,
          love: 0,
          happy: 0,
          wow: 0,
          sad: 0,
          angry: 0
        },
        previousReaction: 'love',
        profilePicture: 'http://place-hold.it/500x500',
        type: 'like',
        userTo: '60263f14648fed5246e322d9'
      },
      authUserPayload
    ) as Request;
    const res: Response = reactionMockResponse();
    const spy = jest.spyOn(ReactionsCache.prototype, 'savePostReactionToCache');
    const reactionSpy = jest.spyOn(reactionsQueue, 'addReactionJob');

    await Create.prototype.reaction(req, res);

    expect(ReactionsCache.prototype.savePostReactionToCache).toHaveBeenCalledWith(spy.mock.calls[0][0]);
    expect(reactionsQueue.addReactionJob).toHaveBeenCalledWith(reactionSpy.mock.calls[0][0], reactionSpy.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post reaction created successfully'
    });
  });
});
