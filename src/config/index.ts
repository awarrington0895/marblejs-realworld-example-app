import { PoolConfig } from "pg";

export interface Config {
  db: PoolConfig;
}

const db: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'example',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || 'conduit',
};

export const config: Config = {
  db
};
