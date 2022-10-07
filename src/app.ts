import express, { Express } from 'express'
import { WannaChatServer } from './setupServer'

class Application {
	public initialize(): void {
		const app: Express = express()
		const server: WannaChatServer = new WannaChatServer(app)
		server.start()
	}
}

const application: Application = new Application()
application.initialize()
