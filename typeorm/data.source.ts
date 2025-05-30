import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
dotenv.config();
import { User } from '../src/user/entities/user.entity';
import { UserCourse } from '../src/user-course/entities/user-course.entity';
import { Courses } from '../src/course/entities/course.entity';
import { Transaction } from '../src/transaction/entities/transaction.entity';
import { Company } from "../src/company/entities/company.entity";
import { InitialMigration1739075935415 } from './1739075935415-initial-migration';
import { AlterTableUuid1739076074487 } from './1739076074487-alter-table-uuid';
import { DeleteTableOperators1739114581240 } from './1739114581240-delete-table-operators'
import { AlterTableUserAddBalance1740002342422 } from './1740002342422-alter-table-user-add-balance'
import { AlterTableUserAddCancelledStatus1740002705637 } from './1740002705637-alter-table-user-add-cancelled-status'
import { AlterTableUserAddCancelledStatus1740003618459 } from './1740003618459-alter-table-user-add-cancelled-status'
import { AlterTableUserCourseAddToken1740274118833 } from "./1740274118833-alter-table-user-course-add-token";
import { Installment } from "../src/installment/entities/installment.entity";
import { OneTimePassword } from "../src/one-time-password/entities/one-time-password.entity";




export const AppDataSource = new DataSource({
    type: 'postgres',
    host:   process.env.DB_HOST,
    port: +(process.env.DB_PORT || ''),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: true,
    synchronize: false,
    entities: [User, UserCourse, Courses, Transaction, Company, Installment, OneTimePassword],
    subscribers: [],
    migrations: [InitialMigration1739075935415, AlterTableUuid1739076074487, DeleteTableOperators1739114581240,AlterTableUserAddBalance1740002342422, AlterTableUserAddCancelledStatus1740002705637, AlterTableUserAddCancelledStatus1740003618459, AlterTableUserCourseAddToken1740274118833],
    migrationsTableName: "migrations_table",
})


