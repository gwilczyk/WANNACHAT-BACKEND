/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cloudinaryUploads from '@globals/helpers/cloudinary-upload';
import { CustomError } from '@globals/helpers/error-handler';
import { authUserPayload } from '@mocks/auth.mock';
import { newPost, postMockRequest, postMockResponse } from '@mocks/posts.mock';
import { Create } from '@posts/controllers/createPosts.controllers';
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

describe('Create', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('post', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postsServer.socketIOPostsObject, 'emit');
      const spy = jest.spyOn(PostsCache.prototype, 'savePostToCache');
      jest.spyOn(postsQueue, 'addPostJob');

      await Create.prototype.post(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postsServer.socketIOPostsObject.emit).toHaveBeenCalledWith('add post', createdPost);
      expect(PostsCache.prototype.savePostToCache).toHaveBeenCalledWith({
        createdPost,
        currentUserId: `${req.currentUser?.userId}`,
        key: spy.mock.calls[0][0].key,
        uId: `${req.currentUser?.uId}`
      });
      expect(postsQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post created successfully'
      });
    });
  });

  describe('postWithImage', () => {
    it('should throw an error if image is not available', () => {
      delete newPost.image;
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();

      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Image is a required field');
      });
    });

    it('should throw an upload error', () => {
      newPost.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '', public_id: '', message: 'Upload error' }));

      Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Upload error');
      });
    });

    it('should send correct json response', async () => {
      newPost.image = 'testing image';
      const req: Request = postMockRequest(newPost, authUserPayload) as Request;
      const res: Response = postMockResponse();
      jest.spyOn(postsServer.socketIOPostsObject, 'emit');
      const spy = jest.spyOn(PostsCache.prototype, 'savePostToCache');
      jest.spyOn(postsQueue, 'addPostJob');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

      await Create.prototype.postWithImage(req, res);
      const createdPost = spy.mock.calls[0][0].createdPost;
      expect(postsServer.socketIOPostsObject.emit).toHaveBeenCalledWith('add post', createdPost);
      expect(PostsCache.prototype.savePostToCache).toHaveBeenCalledWith({
        createdPost,
        currentUserId: `${req.currentUser?.userId}`,
        key: spy.mock.calls[0][0].key,
        uId: `${req.currentUser?.uId}`
      });
      expect(postsQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image created successfully'
      });
    });
  });
});
