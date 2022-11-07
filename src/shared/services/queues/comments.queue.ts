import { ICommentJob } from '@comments/interfaces/comments.interfaces';
import { BaseQueue } from '@services/queues/base.queue';
import { commentsWorkers } from '@workers/comments.workers';

class CommentsQueue extends BaseQueue {
  constructor() {
    super('commentsQueue');
    this.processJob('addCommentToDB', 5, commentsWorkers.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentsQueue: CommentsQueue = new CommentsQueue();
