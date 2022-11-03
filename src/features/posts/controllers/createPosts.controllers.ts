import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { uploads } from '@globals/helpers/cloudinary-upload';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { postSchema, postWithImageSchema } from '@posts/schemes/posts.scheme';
import { postsQueue } from '@services/queues/posts.queue';
import { PostsCache } from '@services/redis/posts.cache';
import { socketIOPostsObject } from '@sockets/posts.sockets';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

const postsCache: PostsCache = new PostsCache();

export class Create {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { bgColor, feelings, gifUrl, post, privacy, profilePicture } = req.body;
    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      avatarColor: req.currentUser!.avatarColor,
      email: req.currentUser!.email,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      bgColor,
      feelings,
      gifUrl,
      post,
      privacy,
      profilePicture,
      commentsCount: 0,
      createdAt: new Date(),
      imgId: '',
      imgVersion: '',
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument;

    socketIOPostsObject.emit('add post', createdPost);

    await postsCache.savePostToCache({
      createdPost,
      currentUserId: `${req.currentUser!.userId}`,
      key: postObjectId,
      uId: `${req.currentUser!.uId}`
    });

    postsQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { bgColor, feelings, gifUrl, image, post, privacy, profilePicture } = req.body;

    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError(result.message);
    }

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      avatarColor: req.currentUser!.avatarColor,
      email: req.currentUser!.email,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      bgColor,
      feelings,
      gifUrl,
      post,
      privacy,
      profilePicture,
      commentsCount: 0,
      createdAt: new Date(),
      imgId: result.public_id,
      imgVersion: result.version.toString(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument;

    socketIOPostsObject.emit('add post', createdPost);

    await postsCache.savePostToCache({
      createdPost,
      currentUserId: `${req.currentUser!.userId}`,
      key: postObjectId,
      uId: `${req.currentUser!.uId}`
    });

    postsQueue.addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });

    /* TODO: Call image queue to add image to mongodb database */

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post with image created successfully' });
  }
}
