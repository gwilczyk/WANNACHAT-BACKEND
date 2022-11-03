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

const postsCache: PostsCache = new PostsCache();

export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    Update.prototype.updatePostWithImage(req);
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePostWithImage(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }

  private async updatePostWithImage(req: Request): Promise<void> {
    const { postId } = req.params;
    const { bgColor, feelings, gifUrl, imgId, imgVersion, post, privacy, profilePicture } = req.body;

    const postUpdate: IPostDocument = { bgColor, feelings, gifUrl, imgId, imgVersion, post, privacy, profilePicture } as IPostDocument;

    const updatedPost: IPostDocument = await postsCache.updatePostInCache(postId, postUpdate);
    socketIOPostsObject.emit('update post', updatedPost, 'posts');
    postsQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });
  }

  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { postId } = req.params;
    const { bgColor, feelings, gifUrl, image, post, privacy, profilePicture } = req.body;

    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }

    const postUpdate: IPostDocument = {
      bgColor,
      feelings,
      gifUrl,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
      post,
      privacy,
      profilePicture
    } as IPostDocument;

    const updatedPost: IPostDocument = await postsCache.updatePostInCache(postId, postUpdate);
    socketIOPostsObject.emit('update post', updatedPost, 'posts');
    postsQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPost });

    /* TODO: Call image queue to add image to mongodb database */

    return result;
  }
}
