import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app.js';
import { ExceptionFilter } from './errors/exception.filter.js';
import { LoggerService } from './logger/logger.service.js';
import { UserController } from './users/users.controller.js';
import { ILogger } from './logger/logger.interface.js';
import { TYPES } from './types.js';
import { IExceptionFilter } from './errors/exception.filter.interface.js';
import { IUserService } from './users/users.service.interface.js';
import { IUserController } from './users/users.controller.interface.js';
import { UserService } from './users/users.service.js';
import { IConfigService } from './config/config.service.interface.js';
import { ConfigService } from './config/config.service.js';
import { PrismaService } from './database/prisma.service.js';
import { IUsersRepository } from './users/users.repository.interface.js';
import { UsersRepository } from './users/users.repository.js';

export interface ICompositionRootReturn {
  app: App;
  appContainer: Container;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
  bind<IExceptionFilter>(TYPES.ExceptionFilter)
    .to(ExceptionFilter)
    .inSingletonScope();
  bind<IUserController>(TYPES.UserController)
    .to(UserController)
    .inSingletonScope();
  bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
  bind<IUsersRepository>(TYPES.UsersRepository)
    .to(UsersRepository)
    .inSingletonScope();
  bind<IConfigService>(TYPES.ConfigService)
    .to(ConfigService)
    .inSingletonScope();
  bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
  bind<App>(TYPES.Application).to(App);
});

const CompositionRoot = (): ICompositionRootReturn => {
  const appContainer = new Container();
  appContainer.load(appBindings);
  const app = appContainer.get<App>(TYPES.Application);
  app.init();
  return { app, appContainer };
};

export const { app, appContainer } = CompositionRoot();
