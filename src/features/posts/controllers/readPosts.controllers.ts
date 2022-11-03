import { IPostDocument } from '@posts/interfaces/posts.interfaces';
import { postsServices } from '@services/db/posts.services';
import { PostsCache } from '@services/redis/posts.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postsCache: PostsCache = new PostsCache();
const PAGE_SIZE = 10;

export class Read {
  public async posts(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page, 10) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page, 10);
    const newSkip: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];
    let totalPosts = 0;

    const cachedPosts: IPostDocument[] = await postsCache.getPostsFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      /* Posts fetched from Redis cache */
      posts = cachedPosts;
      totalPosts = await postsCache.getPostsNumberInCache();
    } else {
      /* Posts fetched from MongoDB */
      posts = await postsServices.getPostsFromDB({}, skip, limit, { createdAt: -1 });
      totalPosts = await postsServices.postsCountInDB();
    }

    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
  }

  public async postsWithImage(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page, 10) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page, 10);
    const newSkip: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];
    const cachedPosts: IPostDocument[] = await postsCache.getPostsWithImageFromCache('post', newSkip, limit);
    posts = cachedPosts.length
      ? cachedPosts
      : await postsServices.getPostsFromDB({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'All posts with image', posts });
  }
}
