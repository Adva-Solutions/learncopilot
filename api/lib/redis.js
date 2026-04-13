import Redis from 'ioredis';

let redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
    });
  }
  return redis;
}
