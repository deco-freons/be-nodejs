import express from 'express';
import { DataSource } from 'typeorm';

import PostgreSQLDatabase from './common/config/postgres';
import Redis from './common/config/redis';
import log from './common/logger/logger';
import errorMiddleware from './common/middleware/error.middleware';

import AuthController from './auth/controller/auth.controller';

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
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initAddress() {
        this.host = this.env == 'DEV' ? 'localhost' : '';
        this.port = this.env == 'DEV' ? 8000 : 8080;
    }

    private initDatabase() {
        this.database = new PostgreSQLDatabase()._database;
    }

    private async initRedis() {
        Redis.connect();
    }

    private initControllers() {
        const AuthC = new AuthController(this.database);
        this.app.use(`${AuthC.path}`, AuthC.router);
    }

    private initErrorHandler() {
        this.app.use(errorMiddleware);
    }

    listen() {
        this.app.listen(this.port, this.host, () => {
            log.info(`Server listing at http://${this.host}:${this.port}`);
        });
    }
}

export default App;
