import { config } from '@root/config';
import { commentsServices } from '@services/db/comments.services';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('commentsWorkers');

class CommentsWorkers {
  async addCommentToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await commentsServices.addPostCommentToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const commentsWorkers: CommentsWorkers = new CommentsWorkers();
