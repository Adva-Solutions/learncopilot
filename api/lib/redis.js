import Redis from 'ioredis';
import { log } from './logger.js';
import { audit } from './audit.js';

let redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
    });
    redis.on('error', (err) => {
      log.error('redis_error', { code: err.code, err: err.message });
      // Fire-and-forget audit; audit() uses the same getRedis() singleton so a
      // total Redis outage will swallow this write (logged via log.error above).
      audit('redis-errors', { code: err.code, message: err.message }).catch(() => {});
    });
    redis.on('end', () => log.warn('redis_connection_ended', {}));
    redis.on('reconnecting', (ms) => log.info('redis_reconnecting', { delayMs: ms }));
  }
  return redis;
}
