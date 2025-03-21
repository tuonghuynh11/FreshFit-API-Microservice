import { MigrationInterface, QueryRunner } from "typeorm";

export class InitRole1722319290856 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO roles (name, "createdBy")
                SELECT 'Admin', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM roles
                    WHERE name = 'Admin'
                );
                INSERT INTO roles (name, "createdBy")
                SELECT 'SuperAdmin', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM roles
                    WHERE name = 'SuperAdmin'
                );
                INSERT INTO roles (name, "createdBy")
                SELECT 'User', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM roles
                    WHERE name = 'User'
                );
                INSERT INTO roles (name, "createdBy")
                SELECT 'Shopkeeper', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM roles
                    WHERE name = 'Shopkeeper'
                );
                `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles WHERE name = 'Admin';
      DELETE FROM roles WHERE name = 'SuperAdmin';
      DELETE FROM roles WHERE name = 'User';
      DELETE FROM roles WHERE name = 'Shopkeeper';
      `);
  }
}
