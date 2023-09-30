import { PrismaClient, UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types.js';

@injectable()
export class PrismaService {
  client: PrismaClient;

  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    this.client = new PrismaClient();
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.logger.log('[PrismaService]: Connected to database');

    } catch (e) {
      if (e instanceof Error) {
        this.logger.error('[PrismaService]: Connection error', e.message);
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}