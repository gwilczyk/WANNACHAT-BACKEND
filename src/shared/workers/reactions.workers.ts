import { config } from '@root/config';
import { reactionsServices } from '@services/db/reactions.services';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('reactionsWorkers');

class ReactionsWorkers {
  async addReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionsServices.addReactionToDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionsServices.removeReactionFromDB(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const reactionsWorkers: ReactionsWorkers = new ReactionsWorkers();
