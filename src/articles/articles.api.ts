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
import { UpdateArticle } from "./update-article";
import { ArticleQueryParams } from "./article-query-params";

const ArticleParams = t.type({ slug: t.string });

type ArticleParams = t.TypeOf<typeof ArticleParams>;

const getArticles$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.use(auth.optional$),
  r.useEffect((req$, { ask }) => {
    const prismaClient = useContext(PrismaConnectionToken)(ask);

    return req$.pipe(
      requestValidator$({ query: ArticleQueryParams }),
      mergeMap(req => db.getAllArticles$(prismaClient)(req.query)),
      map(ArticleResponse.fromArticles),
      mapToBody()
    );
  })
);

const getArticle$ = r.pipe(
  r.matchPath("/:slug"),
  r.matchType("GET"),
  r.useEffect((req$, { ask }) => {
    const prismaClient = useContext(PrismaConnectionToken)(ask);

    return req$.pipe(
      requestValidator$({ params: ArticleParams }),
      map(req => req.params.slug),
      mergeMap(F.pipe(prismaClient, db.getArticle$)),
      errIfEmpty(),
      map(article => ({ article })),
      mapToBody()
    );
  })
);

const postArticle$ = r.pipe(
  r.matchPath("/"),
  r.matchType("POST"),
  r.use(auth.required$),
  r.useEffect((req$, { ask }) => {
    const prismaClient = useContext(PrismaConnectionToken)(ask);

    return req$.pipe(
      requestValidator$({ body: CreateArticle }),
      mergeMap(req =>
        db.createArticle$(prismaClient)(req.body, req.user.username)
      ),
      map(createdArticle => ({ article: createdArticle })),
      mapToBody()
    );
  })
);

const putArticle$ = r.pipe(
  r.matchPath("/:slug"),
  r.matchType("PUT"),
  r.use(auth.required$),
  r.useEffect((req$, { ask }) => {
    const prismaClient = useContext(PrismaConnectionToken)(ask);

    return req$.pipe(
      requestValidator$({ params: ArticleParams, body: UpdateArticle }),
      map(req => ({
        slug: req.params.slug,
        username: req.user.username,
        updateArticle: req.body,
      })),
      mergeMap(({ slug, username, updateArticle }) =>
        db.updateArticle$(prismaClient)(slug, username, updateArticle)
      ),
      map(article => ({ article })),
      mapToBody()
    );
  })
);

export const articlesApi$ = combineRoutes("/articles", {
  effects: [getArticles$, getArticle$, postArticle$, putArticle$],
});
