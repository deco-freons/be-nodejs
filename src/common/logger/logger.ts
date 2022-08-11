import pinoHttp from 'pino-http';
import pinoLogger from './pino.logger';

const Log = pinoHttp({
    logger: pinoLogger,
    autoLogging: true,

    wrapSerializers: false,
    serializers: {},

    customReceivedMessage(req, _) {
        return `REQUEST: ${req.method} ${req.url}`;
    },

    customSuccessMessage(req, res) {
        return `RESPONSE: ${req.method} ${req.url} -> ${res.statusCode} ${res.statusMessage}`;
    },

    customErrorMessage(req, res, error) {
        return `ERROR: ${req.method} ${req.url} -> ${res.statusCode} ${res.statusMessage} ${error.message}`;
    },
});

export default Log;
