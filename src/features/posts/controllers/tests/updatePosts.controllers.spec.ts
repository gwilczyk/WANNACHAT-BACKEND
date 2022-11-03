/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cloudinaryUploads from '@globals/helpers/cloudinary-upload';
import { authUserPayload } from '@mocks/auth.mock';
import { postMockData, postMockRequest, postMockResponse, updatedPost, updatedPostWithImage } from '@mocks/posts.mock';
import { Update } from '@posts/controllers/updatePosts.controllers';
import { postsQueue } from '@services/queues/posts.queue';
import { PostsCache } from '@services/redis/posts.cache';
import * as postsServer from '@sockets/posts.sockets';
import { Request, Response } from 'express';
import { Server } from 'socket.io';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/posts.cache');
jest.mock('@globals/helpers/cloudinary-upload');

Object.defineProperties(postsServer, {
  socketIOPostsObject: {
    value: new Server(),
    writable: true
  }
});

describe('Update', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('posts', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(updatedPost, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostsCache.prototype, 'updatePostInCache').mockResolvedValue(postMockData);
      jest.spyOn(postsServer.socketIOPostsObject, 'emit');
      jest.spyOn(postsQueue, 'addPostJob');

      await Update.prototype.post(req, res);
      expect(postSpy).toHaveBeenCalledWith(`${postMockData._id}`, updatedPost);
      expect(postsServer.socketIOPostsObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postsQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully'
      });
    });
  });

  describe('postWithImage', () => {
    it('should send correct json response if imgId and imgVersion exists', async () => {
      updatedPostWithImage.imgId = '1234';
      updatedPostWithImage.imgVersion = '1234';
      updatedPost.imgId = '1234';
      updatedPost.imgVersion = '1234';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostsCache.prototype, 'updatePostInCache');
      jest.spyOn(postsServer.socketIOPostsObject, 'emit');
      jest.spyOn(postsQueue, 'addPostJob');

      await Update.prototype.postWithImage(req, res);
      expect(PostsCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(postsServer.socketIOPostsObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postsQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });

    it('should send correct json response if no imgId and imgVersion', async () => {
      updatedPostWithImage.imgId = '1234';
      updatedPostWithImage.imgVersion = '1234';
      updatedPost.imgId = '1234';
      updatedPost.imgVersion = '1234';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostsCache.prototype, 'updatePostInCache');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));
      jest.spyOn(postsServer.socketIOPostsObject, 'emit');
      jest.spyOn(postsQueue, 'addPostJob');

      await Update.prototype.postWithImage(req, res);
      expect(PostsCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(postsServer.socketIOPostsObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postsQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });
  });
});
