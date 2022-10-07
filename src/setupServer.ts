import { Application } from 'express'
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

	private securityMiddleware(app: Application): void {}

	private standardMiddleware(app: Application): void {}

	private routesMiddleware(app: Application): void {}

	private globalErrorHandler(app: Application): void {}

	private startServer(app: Application): void {}

	private createSocketIO(httpServer: Server): void {}

	private startHttpServer(httpServer: Server): void {}
}
