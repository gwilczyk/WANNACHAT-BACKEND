import compression from 'compression'
import cookieSession from 'cookie-session'
import cors from 'cors'
import { Application, json, urlencoded } from 'express'
import 'express-async-errors'
import helmet from 'helmet'
import hpp from 'hpp'
import { Server } from 'http'

export class WannaChatServer {
	private app: Application

	constructor(app: Application) {
		this.app = app
	}

	public start(): void {
		this.securityMiddleware(this.app)
		this.standardMiddleware(this.app)
		this.routesMiddleware(this.app)
		this.globalErrorHandler(this.app)
		this.startServer(this.app)
	}

	private securityMiddleware(app: Application): void {
		app.use(
			cookieSession({
				name: 'session',
				keys: ['test1', 'test2'],
				maxAge: 7 * 24 * 3600000 /* 7 days */,
				secure: false,
			})
		)
		app.use(hpp())
		app.use(helmet())
		app.use(
			cors({
				origin: '*',
				credentials: true,
				optionsSuccessStatus: 200,
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			})
		)
	}

	private standardMiddleware(app: Application): void {
		app.use(compression())
		app.use(json({ limit: '50mb' }))
		app.use(urlencoded({ extended: true, limit: '50mb' }))
	}

	private routesMiddleware(app: Application): void {}

	private globalErrorHandler(app: Application): void {}

	private startServer(app: Application): void {}

	private createSocketIO(httpServer: Server): void {}

	private startHttpServer(httpServer: Server): void {}
}
