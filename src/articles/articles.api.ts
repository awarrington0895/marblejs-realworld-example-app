import { combineRoutes, r } from "@marblejs/http";
import { articles$ } from "./article.effect";

const getArticles$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.useEffect(articles$)
);

export const articlesApi$ = combineRoutes("/articles", {
  effects: [getArticles$],
});
