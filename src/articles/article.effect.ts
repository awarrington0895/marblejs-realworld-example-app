import { HttpEffect, HttpError, HttpServer, HttpStatus } from "@marblejs/http";
import * as O from "fp-ts/lib/Option";
import { pipe, throwError, of, SchedulerLike } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import * as db from "./articles.db";
import * as F from "fp-ts/lib/function";
import { requestValidator$, t } from "@marblejs/middleware-io";
import { UUID } from "./uuid.brand";
import * as ArticleResponse from "./article.response";
import { CreateArticle } from "./create-article";
import { PrismaConnectionToken } from "@conduit/db";
import { EffectContext, useContext } from "@marblejs/core";

const ValidCreateArticle = t.type({
  article: t.type({
    title: t.string,
    description: t.string,
    body: t.string,
  }),
});

type ValidCreateArticle = t.TypeOf<typeof ValidCreateArticle>;

const validateCreateArticle = requestValidator$({
  body: ValidCreateArticle,
});

const ArticleParams = t.type({
  slug: UUID,
});

type ArticleParams = t.TypeOf<typeof ArticleParams>;

const validateArticleParams = requestValidator$({
  params: ArticleParams,
});

const mapToBody = () => pipe(map(x => ({ body: x })));

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

export const articles$: HttpEffect = (
  req$,
  ctx: EffectContext<HttpServer, SchedulerLike>
) =>
  req$.pipe(
    mergeMap(
      F.pipe(useContext(PrismaConnectionToken)(ctx.ask), db.getAllArticles$)
    ),
    map(ArticleResponse.fromArticles),
    mapToBody()
  );

export const article$: HttpEffect = (
  req$,
  ctx: EffectContext<HttpServer, SchedulerLike>
) =>
  req$.pipe(
    validateArticleParams,
    map(req => req.params.slug),
    mergeMap(
      F.pipe(useContext(PrismaConnectionToken)(ctx.ask), db.getArticle$)
    ),
    errIfEmpty(),
    map(article => ({ article })),
    mapToBody()
  );

export const createArticle$: HttpEffect = (
  req$,
  ctx: EffectContext<HttpServer, SchedulerLike>
) =>
  req$.pipe(
    validateCreateArticle,
    map(req => req.body as CreateArticle),
    mergeMap(
      F.pipe(useContext(PrismaConnectionToken)(ctx.ask), db.createArticle$)
    ),
    map(createdArticle => ({ article: createdArticle })),
    mapToBody()
  );
