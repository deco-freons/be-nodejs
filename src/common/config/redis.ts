import { createClient } from 'redis';

import log from '../logger/logger';
import dotenv from 'dotenv';

dotenv.config();

const Redis = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
Redis.on('connect', () => log.info('Redis Connected'));
Redis.on('error', () => log.error('Redis Client Error'));

export default Redis;
