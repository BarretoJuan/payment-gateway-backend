import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableUserCourseAddToken1740274118833 implements MigrationInterface {
    name = 'AlterTableUserCourseAddToken1740274118833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "USER-COURSE" ADD "token" character varying`);
      }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "USER-COURSE" DROP COLUMN "token"`);
    }

}
