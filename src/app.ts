import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { DataSource } from 'typeorm';

import Log from './common/logger/logger';
import PostgreSQLDatabase from './common/config/postgres';
import Redis from './common/config/redis';
import errorMiddleware from './common/middleware/error.middleware';
import pinoLogger from './common/logger/pino.logger';

import AuthController from './auth/controller/auth.controller';
import UserController from './user/controller/user.controller';
import EventController from './event/controller/event.controller';

class App {
    public app: express.Application;
    public env: string;
    public host: string;
    public port: number;
    public database: DataSource;

    constructor(env: string) {
        this.app = express();
        this.env = env;

        this.initMiddleware();
        this.initAddress();
        this.initDatabase();
        this.initRedis();
        this.initControllers();
        this.initErrorHandler();
    }

    private initMiddleware() {
        this.app.use(helmet());
        this.app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(Log);
    }

    private initAddress() {
        this.host = process.env.HOST;
        this.port = Number(process.env.PORT);
    }

    private initDatabase() {
        this.database = new PostgreSQLDatabase()._database;
    }

    private async initRedis() {
        await Redis.connect();
    }

    private initControllers() {
        const AuthC = new AuthController(this.database);
        const UserC = new UserController(this.database);
        const EventC = new EventController(this.database);
        
        this.app.use(`${AuthC.path}`, AuthC.router);
        this.app.use(`${UserC.path}`, UserC.router);
        this.app.use(`${EventC.path}`, EventC.router);
    }

    private initErrorHandler() {
        this.app.use(errorMiddleware);
    }

    listen() {
        this.app.listen(this.port, this.host, () => {
            pinoLogger.info(`Server listing at http://${this.host}:${this.port}`);
        });
    }
}

export default App;
