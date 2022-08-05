import { DataSource } from 'typeorm';

class PostgreSQLDatabase {
    private database: DataSource;

    constructor() {
        this.initDatabase;
    }

    initDatabase(): void {
        const database = new DataSource({
            type: 'postgres',
            host: process.env.HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: true,
            logging: false,
            entities: [],
            migrations: [],
            subscribers: [],
        });
        this.database = database;
    }

    get _database(): DataSource {
        return this.database;
    }
}

export default PostgreSQLDatabase;
