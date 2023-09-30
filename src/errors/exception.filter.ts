import { NextFunction, Request, Response } from 'express';
import { IExceptionFilter } from './exception.filter.interface.js';
import { HTTPError } from './http-error.class.js';
import { inject, injectable } from 'inversify';
import { ILogger } from '../logger/logger.interface.js';
import { TYPES } from '../types.js';
import 'reflect-metadata';

@injectable()
export class ExceptionFilter implements IExceptionFilter {
  constructor(@inject(TYPES.ILogger) private logger: ILogger) {}

  catch(
    err: Error | HTTPError,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (err instanceof HTTPError) {
      this.logger.error(
        `${err.context?.toUpperCase || ''} Error: ${err.statusCode} : ${
          err.message
        }`,
      );
      res.status(err.statusCode).send({ error: err.message });
    } else {
      this.logger.error(err.message);
      res.status(500).send({ error: err.message });
    }
  }
}
