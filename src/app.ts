import express from 'express';
import { DataSource } from 'typeorm';
import PostgreSQLDatabase from './common/config/db/postgres';
import AuthController from './auth/controller/auth.controller';
import log from './common/logger/logger';
import errorMiddleware from './common/middleware/error.middleware';

class App {
    public app: express.Application;
    public env: string;
    public host: string;
    public port: number;
    public database: DataSource;

    constructor(env: string) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.env = env;

        this.initAddress();
        this.initDatabase();
        this.initControllers();
        this.initErrorHandler();
    }

    initAddress() {
        this.host = this.env == 'DEV' ? 'localhost' : '';
        this.port = this.env == 'DEV' ? 8000 : 8080;
    }

    initDatabase() {
        this.database = new PostgreSQLDatabase()._database;
    }

    initControllers() {
        const AuthC = new AuthController(this.database);
        this.app.use(`${AuthC.path}`, AuthC.router);
    }

    initErrorHandler() {
        this.app.use(errorMiddleware);
    }

    listen() {
        this.app.listen(this.port, this.host, () => {
            log.info(`Server listing at http://${this.host}:${this.port}`);
        });
    }
}

export default App;
