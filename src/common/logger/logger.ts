import logger from 'pino';
import pretty from 'pino-pretty';
import dayjs from 'dayjs';

const stream = pretty({
    colorize: true,
    customPrettifiers: {
        time: () => `[${dayjs().format('DD-MMMM-YYYY HH:mm:ss Z')}]`,
    },
});

const log = logger(stream);

export default log;
