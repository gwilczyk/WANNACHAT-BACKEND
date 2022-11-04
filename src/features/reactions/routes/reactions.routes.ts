import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Create } from '@reactions/controllers/createReactions.controllers';
import express, { Router } from 'express';

class ReactionsRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/posts/reactions', authMiddleware.checkAuthentication, Create.prototype.reaction);

    return this.router;
  }
}

export const reactionsRoutes: ReactionsRoutes = new ReactionsRoutes();
