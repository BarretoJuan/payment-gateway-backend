import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1739075935415 implements MigrationInterface {
    name = 'InitialMigration1739075935415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."USER-COURSE_status_enum" AS ENUM('completed', 'in_process', 'rejected', 'ready_to_be_checked')`);
        await queryRunner.query(`CREATE TABLE "USER-COURSE" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "status" "public"."USER-COURSE_status_enum", "course_id" uuid, "user_id" uuid, CONSTRAINT "PK_fad34106e72c24adc025444d273" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "user-course_pkey" ON "USER-COURSE" ("id") `);
        await queryRunner.query(`CREATE TABLE "COURSES" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "price" numeric, "name" character varying, "description" character varying, "image" jsonb, CONSTRAINT "PK_27fddb82290e2c8378be8159ef8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "COURSES_pkey" ON "COURSES" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."OPERATOR_role_enum" AS ENUM('admin', 'accounting')`);
        await queryRunner.query(`CREATE TABLE "OPERATOR" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "email" character varying NOT NULL, "identification" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "role" "public"."OPERATOR_role_enum", CONSTRAINT "UQ_0b6f7ba03d950afa79a2800e387" UNIQUE ("email"), CONSTRAINT "UQ_1015ed541d075ee39382f96d8cf" UNIQUE ("identification"), CONSTRAINT "PK_a17cb5a62eda6e942f611ce3825" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "OPERATOR_identification_key" ON "OPERATOR" ("identification") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "OPERATOR_pkey" ON "OPERATOR" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "OPERATOR_email_key" ON "OPERATOR" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."TRANSACTION_payment_method_enum" AS ENUM('paypal', 'zelle')`);
        await queryRunner.query(`CREATE TYPE "public"."TRANSACTION_status_enum" AS ENUM('completed', 'in_process', 'rejected', 'ready_to_be_checked')`);
        await queryRunner.query(`CREATE TABLE "TRANSACTION" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "amount" numeric, "description" character varying, "payment_method" "public"."TRANSACTION_payment_method_enum", "status" "public"."TRANSACTION_status_enum", "course_id" uuid, "user_id" uuid, "validated_by" uuid, CONSTRAINT "PK_b20d8e9bb606acb6363c27cb991" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "TRANSACTION_pkey" ON "TRANSACTION" ("id") `);
        await queryRunner.query(`CREATE TABLE "USER" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "identification_number" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "password" character varying, CONSTRAINT "UQ_05349e17b520cd71c54b4977cf0" UNIQUE ("identification_number"), CONSTRAINT "PK_480564dbef3c7391661ce3b9d5c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "USER_identification_number_key" ON "USER" ("identification_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "USER_pkey" ON "USER" ("id") `);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_488f672c3d3088e4f7406929093" FOREIGN KEY ("validated_by") REFERENCES "OPERATOR"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_488f672c3d3088e4f7406929093"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584"`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69"`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9"`);
        await queryRunner.query(`DROP INDEX "public"."USER_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."USER_identification_number_key"`);
        await queryRunner.query(`DROP TABLE "USER"`);
        await queryRunner.query(`DROP INDEX "public"."TRANSACTION_pkey"`);
        await queryRunner.query(`DROP TABLE "TRANSACTION"`);
        await queryRunner.query(`DROP TYPE "public"."TRANSACTION_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."TRANSACTION_payment_method_enum"`);
        await queryRunner.query(`DROP INDEX "public"."OPERATOR_email_key"`);
        await queryRunner.query(`DROP INDEX "public"."OPERATOR_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."OPERATOR_identification_key"`);
        await queryRunner.query(`DROP TABLE "OPERATOR"`);
        await queryRunner.query(`DROP TYPE "public"."OPERATOR_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."COURSES_pkey"`);
        await queryRunner.query(`DROP TABLE "COURSES"`);
        await queryRunner.query(`DROP INDEX "public"."user-course_pkey"`);
        await queryRunner.query(`DROP TABLE "USER-COURSE"`);
        await queryRunner.query(`DROP TYPE "public"."USER-COURSE_status_enum"`);
    }

}
