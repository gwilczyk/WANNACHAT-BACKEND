import { Signin } from '@auth/controllers/signin.controller';
import { Signout } from '@auth/controllers/signout.controller';
import { Signup } from '@auth/controllers/signup.controller';
import express, { Router } from 'express';
import { Password } from './../controllers/password.controller';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/forgot-password', Password.prototype.create);
    this.router.post('/signup', Signup.prototype.create);
    this.router.post('/signin', Signin.prototype.read);

    return this.router;
  }

  public signoutRoute(): Router {
    this.router.get('/signout', Signout.prototype.update);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
