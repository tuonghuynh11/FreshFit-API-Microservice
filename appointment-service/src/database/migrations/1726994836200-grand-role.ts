import { MigrationInterface, QueryRunner } from "typeorm";

export class GrandRole1726994836200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //get role id
    const adminRole = await queryRunner.query(
      `SELECT id FROM roles WHERE name = 'Admin'`
    );
    const userRole = await queryRunner.query(
      `SELECT id FROM roles WHERE name = 'User'`
    );
    const shopeKeeperRole = await queryRunner.query(
      `SELECT id FROM roles WHERE name = 'Shopkeeper'`
    );
    const superAdminRole = await queryRunner.query(
      `SELECT id FROM roles WHERE name = 'SuperAdmin'`
    );
    await queryRunner.query(
      `
      UPDATE users SET "roleId" = '${adminRole[0].id}' WHERE email = 'admin@yopmail.com';
      UPDATE users SET "roleId" = '${userRole[0].id}' WHERE email = 'user@yopmail.com';
      UPDATE users SET "roleId" = '${shopeKeeperRole[0].id}' WHERE email = 'shopkeeper@yopmail.com';
      UPDATE users SET "roleId" = '${superAdminRole[0].id}' WHERE email = 'superAdmin@yopmail.com'
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE email='admin@yopmail.com';
      DELETE FROM sessions WHERE email='admin@yopmail.com';

      DELETE FROM users WHERE email='user@yopmail.com';
      DELETE FROM sessions WHERE email='user@yopmail.com';

      DELETE FROM users WHERE email='shopkeeper@yopmail.com';
      DELETE FROM sessions WHERE email='shopkeeper@yopmail.com';

      DELETE FROM users WHERE email='superAdmin@yopmail.com';
      DELETE FROM sessions WHERE email='superAdmin@yopmail.com';
      `
    );
  }
}
