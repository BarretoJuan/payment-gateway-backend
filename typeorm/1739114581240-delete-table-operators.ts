import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteTableOperators1739114581240 implements MigrationInterface {
    name = 'DeleteTableOperators1739114581240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_488f672c3d3088e4f7406929093"`);
        await queryRunner.query(`ALTER TABLE "USER" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "USER" ADD CONSTRAINT "UQ_c090db0477be7a25259805e37c2" UNIQUE ("email")`);
        await queryRunner.query(`CREATE TYPE "public"."USER_role_enum" AS ENUM('admin', 'accounting', 'user')`);
        await queryRunner.query(`ALTER TABLE "USER" ADD "role" "public"."USER_role_enum"`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584"`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6"`);
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`CREATE UNIQUE INDEX "user-course_pkey" ON "USER-COURSE" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "COURSES_pkey" ON "COURSES" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "TRANSACTION_pkey" ON "TRANSACTION" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "USER_identification_number_key" ON "USER" ("identification_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "USER_pkey" ON "USER" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "USER_email_key" ON "USER" ("email") `);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_488f672c3d3088e4f7406929093" FOREIGN KEY ("validated_by") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_488f672c3d3088e4f7406929093"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584"`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69"`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9"`);
        await queryRunner.query(`DROP INDEX "public"."USER_email_key"`);
        await queryRunner.query(`DROP INDEX "public"."USER_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."USER_identification_number_key"`);
        await queryRunner.query(`DROP INDEX "public"."TRANSACTION_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."COURSES_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."user-course_pkey"`);
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "USER" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."USER_role_enum"`);
        await queryRunner.query(`ALTER TABLE "USER" DROP CONSTRAINT "UQ_c090db0477be7a25259805e37c2"`);
        await queryRunner.query(`ALTER TABLE "USER" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_488f672c3d3088e4f7406929093" FOREIGN KEY ("validated_by") REFERENCES "OPERATOR"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
