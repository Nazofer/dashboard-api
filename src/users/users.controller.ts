import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../common/base.controller.js';
import { HTTPError } from '../errors/http-error.class.js';
import { ILogger } from '../logger/logger.interface.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types.js';
import 'reflect-metadata';
import { IUserController } from './users.controller.interface.js';
import { UserLoginDto } from './dto/user-login.dto.js';
import { UserRegisterDto } from './dto/user-register.dto.js';
import { IUserService } from './users.service.interface.js';
import { ValidateMiddleware } from '../common/validate.middleware.js';
import jsonwebtoken from 'jsonwebtoken';
import { IConfigService } from '../config/config.service.interface.js';
import { AuthGuard } from '../common/auth.guard.js';

@injectable()
export class UserController extends BaseController implements IUserController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.ConfigService) private configService: IConfigService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        method: 'post',
        path: '/login',
        func: this.login,
        middlewares: [new ValidateMiddleware(UserLoginDto)],
      },
      {
        method: 'post',
        path: '/register',
        func: this.register,
        middlewares: [new ValidateMiddleware(UserRegisterDto)],
      },
      {
        method: 'get',
        path: '/info',
        func: this.info,
        middlewares: [new AuthGuard()],
      },
    ]);
  }

  async login(
    req: Request<{}, {}, UserLoginDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await this.userService.validateUser(req.body);
    if (!result) {
      return next(new HTTPError('Authorization error', 401, 'login'));
    }
    const jwt = await this.signJWT(
      req.body.email,
      this.configService.get('SECRET'),
    );
    this.ok(res, { jwt });
  }

  async register(
    { body }: Request<{}, {}, UserRegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await this.userService.createUser(body);
    if (!result) {
      return next(new HTTPError('User already exists', 422, 'register'));
    }
    this.created(res, {
      email: result.email,
      name: result.name,
      id: result.id,
    });
  }

  async info(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    console.log(req.user);
    
    const userInfo = await this.userService.getUserInfo(req.user);
    console.log(userInfo);
    
    this.ok(res, { email: userInfo?.email, name: userInfo?.name, id: userInfo?.id });
  }

  private signJWT(email: string, secret: string): Promise<string> {
    return new Promise((resolve, reject) => {
      jsonwebtoken.sign(
        { email, iat: Math.floor(Date.now() / 1000) },
        secret,
        { algorithm: 'HS256' },
        (err, token) => {
          if (err) {
            reject(err);
          }
          resolve(token as string);
        },
      );
    });
  }
}
