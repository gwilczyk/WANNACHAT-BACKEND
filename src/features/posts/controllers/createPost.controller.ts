import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { postSchema } from '@posts/schemes/posts.scheme';
import { PostsCache } from '@services/redis/posts.cache';
import { socketIOPostsObject } from '@sockets/posts.sockets';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

const postsCache: PostsCache = new PostsCache();

export class Create {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, feelings, gifUrl, profilePicture } = req.body;
    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument;

    socketIOPostsObject.emit('add post', createdPost);

    await postsCache.savePostToCache({
      createdPost,
      currentUserId: `${req.currentUser!.userId}`,
      key: postObjectId,
      uId: `${req.currentUser!.uId}`
    });

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }
}
