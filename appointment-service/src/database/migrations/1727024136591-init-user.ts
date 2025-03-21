import { MigrationInterface, QueryRunner } from "typeorm";
import { getHashPassword } from "../../utils";

export class InitUser1727024136591 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO users ("displayName", username, email, "hashPassword", status, "createdBy")
                SELECT 'Admin', 'admin', 'admin@yopmail.com', '${getHashPassword(
                  "Ecommerce@123456"
                )}', 'ACTIVE', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM users
                    WHERE email = 'admin@yopmail.com'
                );
                INSERT INTO users ("displayName", username, email, "hashPassword", status, "createdBy")
                SELECT 'User', 'user', 'user@yopmail.com', '${getHashPassword(
                  "Ecommerce@123456"
                )}', 'ACTIVE', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM users
                    WHERE email = 'user@yopmail.com'
                );
                  INSERT INTO users ("displayName", username, email, "hashPassword", status, "createdBy")
                SELECT 'Shopkeeper', 'shopkeeper', 'shopkeeper@yopmail.com', '${getHashPassword(
                  "Ecommerce@123456"
                )}', 'ACTIVE', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM users
                    WHERE email = 'shopkeeper@yopmail.com'
                );
                  INSERT INTO users ("displayName", username, email, "hashPassword", status, "createdBy")
                SELECT 'SuperAdmin', 'superAdmin', 'superAdmin@yopmail.com', '${getHashPassword(
                  "Ecommerce@123456"
                )}', 'ACTIVE', 'migration'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM users
                    WHERE email = 'superAdmin@yopmail.com'
                );
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
