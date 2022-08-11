import { createClient } from 'redis';

import pinoLogger from '../logger/pino.logger';
import dotenv from 'dotenv';

dotenv.config();

const Redis = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
Redis.on('connect', () => pinoLogger.info('Redis Connected'));
Redis.on('error', () => pinoLogger.error('Redis Client Error'));

export default Redis;
