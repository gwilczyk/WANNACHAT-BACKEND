import { authRoutes } from '@auth/routes/auth.routes';
import { currentUserRoutes } from '@auth/routes/currentUser.routes';
import { commentsRoutes } from '@comments/routes/comments.routes';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { postsRoutes } from '@posts/routes/posts.routes';
import { reactionsRoutes } from '@reactions/routes/reactions.routes';
import { serverAdapter } from '@services/queues/base.queue';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postsRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionsRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentsRoutes.routes());
  };
  routes();
};
