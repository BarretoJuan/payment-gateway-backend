import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableUserAddCancelledStatus1740003618459 implements MigrationInterface {
    name = 'AlterTableUserAddCancelledStatus1740003618459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."USER-COURSE_status_enum" RENAME TO "USER-COURSE_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."USER-COURSE_status_enum" AS ENUM('acquired', 'not_acquired', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "status" TYPE "public"."USER-COURSE_status_enum" USING "status"::"text"::"public"."USER-COURSE_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."USER-COURSE_status_enum_old"`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."USER-COURSE_status_enum_old" AS ENUM('completed', 'in_process', 'rejected', 'ready_to_be_checked', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ALTER COLUMN "status" TYPE "public"."USER-COURSE_status_enum_old" USING "status"::"text"::"public"."USER-COURSE_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."USER-COURSE_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."USER-COURSE_status_enum_old" RENAME TO "USER-COURSE_status_enum"`);

    }

}
