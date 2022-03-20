import * as Article from "./article";

const empty: ArticleResponse = {
  articles: [],
  articlesCount: 0,
};

interface ArticleResponse {
  readonly articles: Article.Type[];
  readonly articlesCount: number;
}

export { empty };
