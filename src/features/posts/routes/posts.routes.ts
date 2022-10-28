import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Create } from '@posts/controllers/createPost.controller';
import express, { Router } from 'express';

class PostsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post-with-image', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);

    return this.router;
  }
}

export const postsRoutes: PostsRoutes = new PostsRoutes();
