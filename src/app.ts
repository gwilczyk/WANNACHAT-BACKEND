import { config } from '@root/config';
import databaseConnection from '@root/setupDatabase';
import { WannaChatServer } from '@root/setupServer';
import express, { Express } from 'express';

class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: WannaChatServer = new WannaChatServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

const application: Application = new Application();
application.initialize();
