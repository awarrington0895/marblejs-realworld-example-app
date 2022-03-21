import { defer, Observable, of } from "rxjs";
import * as Article from "./article";
import { Option } from "fp-ts/lib/Option";
import { findFirst } from 'fp-ts/lib/Array';
import * as F from "fp-ts/lib/function";

const articlesDb: Article.Type[] = [Article.empty];

const getAllArticles$ = (): Observable<Article.Type[]> => {
  return of(articlesDb);
};

const findArticle$ = (slug: string) => F.pipe(
  articlesDb,
  findFirst((article: Article.Type) => article.slug === slug),
  of
);

const getArticle$ = (slug: string): Observable<Option<Article.Type>> => defer(() => findArticle$(slug))

export { getAllArticles$, getArticle$ };
