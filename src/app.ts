import express, { Express } from 'express'
import databaseConnection from './setupDatabase'
import { WannaChatServer } from './setupServer'

class Application {
	public initialize(): void {
		databaseConnection()
		const app: Express = express()
		const server: WannaChatServer = new WannaChatServer(app)
		server.start()
	}
}

const application: Application = new Application()
application.initialize()
