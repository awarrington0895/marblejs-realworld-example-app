import { useContext } from "@marblejs/core";
import { combineRoutes, HttpStatus, r } from "@marblejs/http";
import { requestValidator$, t } from "@marblejs/middleware-io";
import { map, mergeMap } from "rxjs/operators";

import * as auth from "@conduit/auth";
import { mapToBody, errIfEmpty } from "@conduit/util";
import * as ArticleResponse from "./article.response";
import { CreateArticle } from "./create-article";
import { UpdateArticle } from "./update-article";
import { ArticleQueryParams } from "./article-query-params";
import { ArticleServiceToken } from "./articles.service";

const ArticleParams = t.type({ slug: t.string });

type ArticleParams = t.TypeOf<typeof ArticleParams>;

const getArticles$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.use(auth.optional$),
  r.useEffect((req$, { ask }) => {
    const articles = useContext(ArticleServiceToken)(ask);

    return req$.pipe(
      requestValidator$({ query: ArticleQueryParams }),
      map(req => req.query),
      mergeMap(articles.getAllArticles$),
      map(ArticleResponse.fromArticles),
      mapToBody()
    );
  })
);

const getArticle$ = r.pipe(
  r.matchPath("/:slug"),
  r.matchType("GET"),
  r.useEffect((req$, { ask }) => {
    const articles = useContext(ArticleServiceToken)(ask);

    return req$.pipe(
      requestValidator$({ params: ArticleParams }),
      map(req => req.params.slug),
      mergeMap(articles.getArticle$),
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
    const articles = useContext(ArticleServiceToken)(ask);

    return req$.pipe(
      requestValidator$({ body: CreateArticle }),
      mergeMap(req => articles.createArticle$(req.body, req.user.username)),
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
    const articles = useContext(ArticleServiceToken)(ask);

    return req$.pipe(
      requestValidator$({ params: ArticleParams, body: UpdateArticle }),
      map(req => ({
        slug: req.params.slug,
        username: req.user.username,
        updateArticle: req.body,
      })),
      mergeMap(articles.updateArticle$),
      map(article => ({ article })),
      mapToBody()
    );
  })
);

const deleteArticle$ = r.pipe(
  r.matchPath("/:slug"),
  r.matchType("DELETE"),
  r.use(auth.required$),
  r.useEffect((req$, { ask }) => {
    const articles = useContext(ArticleServiceToken)(ask);

    return req$.pipe(
      requestValidator$({ params: ArticleParams }),
      map(req => req.params.slug),
      mergeMap(articles.deleteArticle$),
      map(() => ({ status: HttpStatus.NO_CONTENT }))
    );
  })
);

export const articlesApi$ = combineRoutes("/articles", {
  effects: [
    getArticles$,
    getArticle$,
    postArticle$,
    putArticle$,
    deleteArticle$,
  ],
});
