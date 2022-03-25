import { defer, from, Observable, of } from "rxjs";
import { map, pluck } from "rxjs/operators";
import * as Article from "./article";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
import { Pool, QueryConfig } from "pg";
import { config } from '@conduit/config';

const pool = new Pool(config.db);

const getAllArticles$ = (): Observable<Article.Type[]> => {
  return from(pool.query("SELECT * FROM conduit.article")).pipe(pluck("rows"));
};

const findArticle$ = (slug: string): Observable<O.Option<Article.Type>> => {
  const query: QueryConfig = {
    text: "SELECT * FROM conduit.article a WHERE a.slug = $1",
    values: [slug],
  };

  const queryResult = from(pool.query(query));

  return queryResult.pipe(
    pluck("rows"),
    map((rows) => A.head(rows))
  );
};

const getArticle$ = (slug: string): Observable<O.Option<Article.Type>> =>
  defer(() => findArticle$(slug));

export { getAllArticles$, getArticle$ };
