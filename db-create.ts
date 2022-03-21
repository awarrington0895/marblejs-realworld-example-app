import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '')
});

const createDB = 'CREATE DATABASE conduit';

(async () => {
  const client = await pool.connect();

  try {

    const createDBRes = await client.query(createDB);

    console.log(createDBRes.rows);
  } finally {
    client.release();
  }
})().catch(err =>console.error(err.stack));

