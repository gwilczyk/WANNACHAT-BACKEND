import express, { Express } from 'express';
import { config } from './config';
import databaseConnection from './setupDatabase';
import { WannaChatServer } from './setupServer';

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
