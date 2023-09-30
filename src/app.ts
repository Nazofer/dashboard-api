import express, { Express } from 'express';
import { Server } from 'http';
import { ILogger } from './logger/logger.interface.js';
import { inject, injectable } from 'inversify';
import { TYPES } from './types.js';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import { IExceptionFilter } from './errors/exception.filter.interface.js';
import { IConfigService } from './config/config.service.interface.js';
import { IUserController } from './users/users.controller.interface.js';
import { UserController } from './users/users.controller.js';
import { PrismaService } from './database/prisma.service.js';
import { AuthMiddleware } from './common/auth.middleware.js';


@injectable()
export class App {
  app: Express;
  server: Server;
  port: number;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.UserController) private userController: UserController,
    @inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.PrismaService) private prismaService: PrismaService,
  ) {
    this.app = express();
    this.port = 8000;
  }

  useMiddlewares(): void {
    this.app.use(bodyParser.json());
    const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
    this.app.use(authMiddleware.execute.bind(authMiddleware));
  }

  useRoutes(): void {
    this.app.use('/users', this.userController.router);
  }

  useExceptionFilters(): void {
    this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  public async init(): Promise<void> {
    this.useMiddlewares();
    this.useRoutes();
    this.useExceptionFilters();
    await this.prismaService.connect();
    this.server = this.app.listen(this.port);
    this.logger.log(`Server running at http://localhost:${this.port}`);
  }
}
