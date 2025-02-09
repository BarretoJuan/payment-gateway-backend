import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableUuid1739076074487 implements MigrationInterface {
    name = 'AlterTableUuid1739076074487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584"`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_488f672c3d3088e4f7406929093"`);
        await queryRunner.query(`ALTER TABLE "OPERATOR" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "OPERATOR" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69"`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" DROP CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6"`);
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
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
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_088fb16075f73b1a3905d1ec5e6" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_b9e1fed67d1dd65a5516b785a69" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "OPERATOR" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "OPERATOR" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_488f672c3d3088e4f7406929093" FOREIGN KEY ("validated_by") REFERENCES "OPERATOR"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "COURSES" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "TRANSACTION" ADD CONSTRAINT "FK_a156aa9d5f0d3f8a83d5e948584" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD CONSTRAINT "FK_9171a4ee1ea68cf58b1be0cb4b9" FOREIGN KEY ("course_id") REFERENCES "COURSES"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

}
