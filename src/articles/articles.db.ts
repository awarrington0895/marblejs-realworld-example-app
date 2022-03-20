import { of } from "rxjs";
import * as Article from "./article";

const articlesDb: Article.Type[] = [Article.empty];

const getAllArticles$ = () => {
  return of(articlesDb);
};

export { getAllArticles$ };
