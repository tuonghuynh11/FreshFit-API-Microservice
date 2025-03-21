import { DataSource, DataSourceOptions } from "typeorm";
import config from "../configuration";
function getConfig(): DataSourceOptions {
  return {
    type: "postgres",
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUsername,
    password: config.dbPassword,
    database: config.dbDatabase,
    synchronize: config.dbSynchronize,
    logging: config.dbLogging,
    entities: [config.dbEntitiesDir],
    subscribers: [config.dbSubscribersDir],
    migrations: [config.dbMigrationsDir],
    ssl: true,
  };
}

export const AppDataSource = new DataSource(getConfig());
