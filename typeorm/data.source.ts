import { DataSource } from "typeorm";
import { User } from "../src/user/entities/user.entity";
import * as dotenv from 'dotenv';
import { CreateTableUser1738552255805 } from "./1738552255805-create-table-user";
dotenv.config();

console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export const AppDataSource = new DataSource({
    type: 'postgres',
    host:   process.env.DB_HOST,
    port: +(process.env.DB_PORT || ''),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: true,
    synchronize: false,
    entities: [User],
    subscribers: [],
    migrations: [CreateTableUser1738552255805],
    migrationsTableName: "migrations_table",
})


