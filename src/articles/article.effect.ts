import { HttpEffect, HttpError, HttpStatus } from "@marblejs/http";
import * as O from "fp-ts/lib/Option";
import { pipe, throwError, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { getAllArticles$, getArticle$ } from "./articles.db";
import * as F from "fp-ts/lib/function";
import { requestValidator$, t } from "@marblejs/middleware-io";
import { UUID } from './uuid.brand';
import * as ArticleResponse from './article.response';

const ArticleParams = t.type({
  slug: UUID
});

type ArticleParams = t.TypeOf<typeof ArticleParams>;

const validateArticleParams = requestValidator$({
  params: ArticleParams,
});

const mapToBody = () => pipe(map((x) => ({ body: x })));

const errIfEmpty = <T>() =>
  pipe(
    mergeMap((opt: O.Option<T>) => {
      return F.pipe(
        opt,
        O.map(of),
        O.getOrElse(() =>
          throwError(
            () => new HttpError("Article not found", HttpStatus.NOT_FOUND)
          )
        )
      );
    })
  );

export const articles$: HttpEffect = (req$) =>
  req$.pipe(
    mergeMap(getAllArticles$),
    map(ArticleResponse.fromArticles),
    mapToBody()
  );

export const article$: HttpEffect = (req$) => {
  return req$.pipe(
    validateArticleParams,
    map((req) => req.params.slug),
    mergeMap(getArticle$),
    errIfEmpty(),
    map((article) => ({ article })),
    mapToBody()
  );
};
