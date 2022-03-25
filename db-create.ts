import { Pool } from "pg";
import { config } from '@conduit/config';

const { database, ...poolConfig } = config.db;

const pool = new Pool(poolConfig);

const createDB = "CREATE DATABASE conduit";

(async () => {
  const client = await pool.connect();

  try {
    const createDBRes = await client.query(createDB);

    console.log(createDBRes.rows);
  } finally {
    client.release();
  }
})().catch((err) => console.error(err.stack));
