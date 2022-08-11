import pino from 'pino';
import pretty from 'pino-pretty';
import dayjs from 'dayjs';

const levels = {
    http: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
};

const pinoLogger = pino(
    {
        customLevels: levels,
        useOnlyCustomLevels: true,
        level: 'http',
        serializers: {
            err: () => undefined,
            req: () => undefined,
            res: () => undefined,
        },
    },
    pretty({
        colorize: true,
        customPrettifiers: {
            time: () => `[${dayjs().format('DD-MMMM-YYYY HH:mm:ss Z')}]`,
        },
    }),
);

export default pinoLogger;
