import { PrismaConnectionToken } from "@conduit/db";
import { useContext } from "@marblejs/core";
import { combineRoutes, HttpError, HttpStatus, r } from "@marblejs/http";
import { requestValidator$, t } from "@marblejs/middleware-io";
import { of, pipe, throwError } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { articles$, createArticle$ } from "./article.effect";
import * as O from "fp-ts/Option";
import * as F from "fp-ts/function";
import * as db from "./articles.db";
import { mapToBody } from "@conduit/util";

const validateArticleParams = requestValidator$({
  params: t.type({
    slug: t.string,
  }),
});

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

const getArticles$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.useEffect(articles$)
);

const getArticle$ = r.pipe(
  r.matchPath("/:slug"),
  r.matchType("GET"),
  r.useEffect((req$, ctx) =>
    req$.pipe(
      validateArticleParams,
      map(req => req.params.slug),
      mergeMap(
        F.pipe(useContext(PrismaConnectionToken)(ctx.ask), db.getArticle$)
      ),
      errIfEmpty(),
      map(article => ({ article })),
      mapToBody()
    )
  )
);

const postArticle$ = r.pipe(
  r.matchPath("/"),
  r.matchType("POST"),
  r.useEffect(createArticle$)
);

export const articlesApi$ = combineRoutes("/articles", {
  effects: [getArticles$, getArticle$, postArticle$],
});
