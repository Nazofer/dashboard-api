import { Logger, ILogObj } from 'tslog';
import { ILogger } from './logger.interface';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class LoggerService implements ILogger {
  public logger: Logger<ILogObj>;

  constructor() {
    // Configure the logger with the custom format
    this.logger = new Logger({
      prettyLogTemplate:
        '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}\t{{logLevelName}}{{name}}\t',
    });
  }

  log(...args: unknown[]): void {
    this.logger.info(...args);
  }

  error(...args: unknown[]): void {
    this.logger.error(...args);
  }

  warn(...args: unknown[]): void {
    this.logger.warn(...args);
  }
}
