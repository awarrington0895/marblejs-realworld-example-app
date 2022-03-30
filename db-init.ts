import { Pool } from "pg";
import { config } from "@conduit/config";

const pool = new Pool(config.db);

const createSchema = "CREATE SCHEMA IF NOT EXISTS conduit";

const createArticles = `CREATE TABLE IF NOT EXISTS conduit."Article"
(
    slug uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tagList" text[] COLLATE pg_catalog."default" NOT NULL DEFAULT array[]::text[],
    favorited boolean NOT NULL DEFAULT FALSE
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
})().catch((err) => console.error(err.stack));
