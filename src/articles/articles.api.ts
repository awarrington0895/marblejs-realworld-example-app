import { combineRoutes, r } from "@marblejs/http";
import { article$, articles$ } from "./article.effect";

const getArticles$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.useEffect(articles$)
);

const getArticle$ = r.pipe(
  r.matchPath("/:slug"),
  r.matchType("GET"),
  r.useEffect(article$)
);

export const articlesApi$ = combineRoutes("/articles", {
  effects: [getArticles$, getArticle$],
});
