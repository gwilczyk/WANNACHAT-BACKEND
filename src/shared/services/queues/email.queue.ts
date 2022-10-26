import { BaseQueue } from '@services/queues/base.queue';
import { IEmailJob } from '@user/interfaces/user.interfaces';
import { emailWorker } from '@workers/email.worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('emailQueue');
    this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail);
  }

  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
