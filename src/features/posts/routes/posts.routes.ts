import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Create } from '@posts/controllers/createPosts.controllers';
import { Delete } from '@posts/controllers/deletePosts.controllers';
import { Read } from '@posts/controllers/readPosts.controllers';
import { Update } from '@posts/controllers/updatePosts.controllers';
import express, { Router } from 'express';

class PostsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/posts/image/post', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.post('/posts', authMiddleware.checkAuthentication, Create.prototype.post);

    this.router.get('/posts/image/:page', authMiddleware.checkAuthentication, Read.prototype.postsWithImage);
    this.router.get('/posts/:page', authMiddleware.checkAuthentication, Read.prototype.posts);

    this.router.put('/posts/:postId', authMiddleware.checkAuthentication, Update.prototype.post);

    this.router.delete('/posts/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);

    return this.router;
  }
}

export const postsRoutes: PostsRoutes = new PostsRoutes();
