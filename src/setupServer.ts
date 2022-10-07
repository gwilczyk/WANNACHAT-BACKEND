import { createAdapter } from '@socket.io/redis-adapter'
import compression from 'compression'
import cookieSession from 'cookie-session'
import cors from 'cors'
import { Application, json, urlencoded } from 'express'
import 'express-async-errors'
import helmet from 'helmet'
import hpp from 'hpp'
import http from 'http'
import { createClient } from 'redis'
import { Server } from 'socket.io'
import { config } from './config'

const SERVER_PORT = 5000

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
				keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
				maxAge: 7 * 24 * 3600000 /* 7 days */,
				secure: config.NODE_ENV !== 'development',
			})
		)
		app.use(hpp())
		app.use(helmet())
		app.use(
			cors({
				origin: config.CLIENT_URL,
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

	private async startServer(app: Application): Promise<void> {
		try {
			const httpServer: http.Server = new http.Server(app)
			const socketIO: Server = await this.createSocketIO(httpServer)
			this.startHttpServer(httpServer)
			this.socketIOConnections(socketIO)
		} catch (error) {
			console.log(error)
		}
	}

	private async createSocketIO(httpServer: http.Server): Promise<Server> {
		const io: Server = new Server(httpServer, {
			cors: {
				origin: config.CLIENT_URL,
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			},
		})
		const pubClient = createClient({ url: config.REDIS_HOST })
		const subClient = pubClient.duplicate()
		await Promise.all([pubClient.connect(), subClient.connect()])
		io.adapter(createAdapter(pubClient, subClient))
		return io
	}

	private startHttpServer(httpServer: http.Server): void {
		console.log(`Server has started with process ${process.pid}`)
		httpServer.listen(SERVER_PORT, () => {
			console.log(`Server running on port ${SERVER_PORT}`)
		})
	}

	private socketIOConnections(io: Server): void {}
}
