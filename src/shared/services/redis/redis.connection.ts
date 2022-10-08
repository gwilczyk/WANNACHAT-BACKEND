import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('redis.connection.ts');

class RedisConnection extends BaseCache {
  constructor() {
    super('redis.connection.ts');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
