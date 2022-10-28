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
      console.log('Posts socketIO handler');
    });
  }
}
