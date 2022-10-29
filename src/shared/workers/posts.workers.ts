import { config } from '@root/config';
import { postsServices } from '@services/db/posts.services';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postsWorkers');

class PostsWorkers {
  async addPostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postsServices.addPostToDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await postsServices.deletePostFromDB(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postsWorkers: PostsWorkers = new PostsWorkers();
