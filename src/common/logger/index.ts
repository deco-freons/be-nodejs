import logger from "pino"
import pretty from "pino-pretty"
import dayjs from "dayjs"

class Logger {
    initLogger() {
        const stream = pretty({
            colorize: true,
            customPrettifiers: {
                time: () => `[${dayjs().format('dddd, DD-MMMM-YYYY HH:mm:ss Z')}]`,
            }
        })

        const log = logger(stream)
        return log
    }
}

export default Logger
