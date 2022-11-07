import { IReactionJob } from '@reactions/interfaces/reactions.interfaces';
import { BaseQueue } from '@services/queues/base.queue';
import { reactionsWorkers } from '@workers/reactions.workers';

class ReactionsQueue extends BaseQueue {
  constructor() {
    super('reactionsQueue');
    this.processJob('addReactionToDB', 5, reactionsWorkers.addReactionToDB);
    this.processJob('removeReactionFromDB', 5, reactionsWorkers.removeReactionFromDB);
  }

  public addReactionJob(name: string, data: IReactionJob): void {
    this.addJob(name, data);
  }
}

export const reactionsQueue: ReactionsQueue = new ReactionsQueue();
