import { IPostJobData } from '@posts/interfaces/posts.interfaces';
import { BaseQueue } from '@services/queues/base.queue';
import { postsWorker } from '@workers/posts.worker';

class PostsQueue extends BaseQueue {
  constructor() {
    super('postsQueue');
    this.processJob('addPostToDB', 5, postsWorker.addPostToDB);
  }

  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postsQueue: PostsQueue = new PostsQueue();
