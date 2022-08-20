import { DataSource } from 'typeorm';
import pinoLogger from '../logger/pino.logger';

import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';

class PostgreSQLDatabase {
    private database: DataSource;

    constructor() {
        this.initDatabase();
        this.connect();
    }

    private initDatabase(): void {
        const database = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: true,
            logging: false,
            entities: [User, Preference],
            migrations: [],
            subscribers: [],
        });
        this.database = database;
    }

    connect() {
        this.database
            .initialize()
            .then(() => {
                pinoLogger.info('Database connected');
            })
            .catch((error) => {
                pinoLogger.error(error);
                pinoLogger.error(`Failed to connect to database ${error.errors}`);
                process.exit(1);
            });
    }

    get _database(): DataSource {
        return this.database;
    }
}

export default PostgreSQLDatabase;
