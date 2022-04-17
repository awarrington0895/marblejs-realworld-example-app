import { PrismaConnectionToken } from "@conduit/db";
import { useContext } from "@marblejs/core";
import { combineRoutes, r } from "@marblejs/http";
import { requestValidator$, t } from "@marblejs/middleware-io";
import { map, mergeMap } from "rxjs/operators";
import * as F from "fp-ts/function";
import * as db from "./articles.db";
import { mapToBody, errIfEmpty } from "@conduit/util";
import * as auth from "@conduit/auth";
import * as ArticleResponse from "./article.response";
import { CreateArticle } from "./create-article";

const validateArticleParams = requestValidator$({
  params: t.type({
    slug: t.string,
  }),
});

const getArticles$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.use(auth.optional$),
  r.useEffect((req$, ctx) =>
    req$.pipe(
      mergeMap(
        F.pipe(useContext(PrismaConnectionToken)(ctx.ask), db.getAllArticles$)
      ),
      map(ArticleResponse.fromArticles),
      mapToBody()
    )
  )
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
  r.useEffect((req$, ctx) =>
    req$.pipe(
      requestValidator$({ body: CreateArticle }),
      map(req => req.body as CreateArticle),
      mergeMap(
        F.pipe(useContext(PrismaConnectionToken)(ctx.ask), db.createArticle$)
      ),
      map(createdArticle => ({ article: createdArticle })),
      mapToBody()
    )
  )
);

export const articlesApi$ = combineRoutes("/articles", {
  effects: [getArticles$, getArticle$, postArticle$],
});
