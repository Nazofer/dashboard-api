import { inject, injectable } from 'inversify';
import { ILogger } from '../logger/logger.interface';
import { IConfigService } from './config.service.interface';
import { DotenvConfigOutput, DotenvParseOutput, config } from 'dotenv';
import { TYPES } from '../types.js';

@injectable()
export class ConfigService implements IConfigService {
  private config: DotenvParseOutput
  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    const result: DotenvConfigOutput = config();
    if (result.error) {
      this.logger.error('[ConfigService]: Config error', result.error);
    } else {
      this.config = result.parsed as DotenvParseOutput;
      this.logger.log('[ConfigService]: Config loaded');
    }
  }

  get(key: string): string {
    return this.config[key];
  }
}