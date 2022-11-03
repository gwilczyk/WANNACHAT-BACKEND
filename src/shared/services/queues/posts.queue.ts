import { IPostJobData } from '@posts/interfaces/posts.interfaces';
import { BaseQueue } from '@services/queues/base.queue';
import { postsWorkers } from '@workers/posts.workers';

class PostsQueue extends BaseQueue {
  constructor() {
    super('postsQueue');
    this.processJob('addPostToDB', 5, postsWorkers.addPostToDB);
    this.processJob('deletePostFromDB', 5, postsWorkers.deletePostFromDB);
    this.processJob('updatePostInDB', 5, postsWorkers.updatePostInDB);
  }

  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postsQueue: PostsQueue = new PostsQueue();
