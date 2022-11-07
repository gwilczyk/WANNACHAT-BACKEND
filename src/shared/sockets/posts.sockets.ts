import { ICommentDocument } from '@comments/interfaces/comments.interfaces';
import { IReactionDocument } from '@reactions/interfaces/reactions.interfaces';
import { Server, Socket } from 'socket.io';

export let socketIOPostsObject: Server;

export class SocketIOPostsHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostsObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('reaction', (reaction: IReactionDocument) => {
        this.io.emit('update post reaction', reaction);
      });

      socket.on('comment', (comment: ICommentDocument) => {
        this.io.emit('update post comment', comment);
      });
    });
  }
}
