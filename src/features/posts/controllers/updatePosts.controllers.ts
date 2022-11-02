import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { postSchema } from '@posts/schemes/posts.scheme';
import { postsQueue } from '@services/queues/posts.queue';
import { PostsCache } from '@services/redis/posts.cache';
import { socketIOPostsObject } from '@sockets/posts.sockets';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postsCache: PostsCache = new PostsCache();

export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const { bgColor, feelings, gifUrl, imgId, imgVersion, post, privacy, profilePicture } = req.body;

    const postUpdate: IPostDocument = { bgColor, feelings, gifUrl, imgId, imgVersion, post, privacy, profilePicture } as IPostDocument;

    const updatedPost: IPostDocument = await postsCache.updatePostInCache(postId, postUpdate);
    socketIOPostsObject.emit('update post', updatedPost, 'posts');
    postsQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });

    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }
}
