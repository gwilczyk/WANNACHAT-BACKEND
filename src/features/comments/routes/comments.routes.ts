import { Create } from '@comments/controllers/createComments.controllers';
import { Read } from '@comments/controllers/readComments.controllers';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import express, { Router } from 'express';

class CommentsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/posts/comments/usernames/:postId', authMiddleware.checkAuthentication, Read.prototype.commentsUsernames);
    this.router.get('/posts/comments/:postId/:commentId', authMiddleware.checkAuthentication, Read.prototype.comment);
    this.router.get('/posts/comments/:postId', authMiddleware.checkAuthentication, Read.prototype.comments);

    this.router.post('/posts/comments', authMiddleware.checkAuthentication, Create.prototype.comment);

    return this.router;
  }
}

export const commentsRoutes: CommentsRoutes = new CommentsRoutes();
