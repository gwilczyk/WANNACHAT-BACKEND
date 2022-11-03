import { BaseQueue } from '@services/queues/base.queue';
import { IUserJob } from '@user/interfaces/user.interfaces';
import { userWorker } from '@workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('userQueue');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
  }

  public addUserJob({ name, data }: { name: string; data: IUserJob }): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
