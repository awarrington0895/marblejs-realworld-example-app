import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || ''),
  database: process.env.DB_NAME
});

const createSchema = "CREATE SCHEMA IF NOT EXISTS conduit";

const createArticles = `CREATE TABLE IF NOT EXISTS conduit.article
(
    slug uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    favorited boolean NOT NULL
)
`;

(async () => {
  const client = await pool.connect();

  try {

    const createSchemaRes = await client.query(createSchema);

    console.log(createSchemaRes.rows);

    const createArticlesRes = await client.query(createArticles);

    console.log(createArticlesRes.rows);
  } finally {
    client.release();
  }
})().catch(err =>console.error(err.stack));