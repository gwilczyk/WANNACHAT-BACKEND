import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Create } from '@posts/controllers/createPost.controller';
import { Get } from '@posts/controllers/getPosts.controller';
import express, { Router } from 'express';

class PostsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/posts/image/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImage);
    this.router.get('/posts/:page', authMiddleware.checkAuthentication, Get.prototype.posts);

    this.router.post('/posts/image/post', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.post('/posts', authMiddleware.checkAuthentication, Create.prototype.post);

    return this.router;
  }
}

export const postsRoutes: PostsRoutes = new PostsRoutes();
