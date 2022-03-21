import { defer, Observable, of } from "rxjs";
import * as Article from "./article";
import { Option } from "fp-ts/lib/Option";
import { findFirst } from 'fp-ts/lib/Array';
import { pipe } from "fp-ts/lib/function";

const articlesDb: Article.Type[] = [Article.empty];

const getAllArticles$ = (): Observable<Article.Type[]> => {
  return of(articlesDb);
};

const getArticle$ = (slug: string): Observable<Option<Article.Type>> => {
  return defer(() => {
    const maybeArticle = pipe(
      articlesDb,
      findFirst((article: Article.Type) => article.slug === slug)
    );

    return of(maybeArticle);
  });
  
}

export { getAllArticles$, getArticle$ };
