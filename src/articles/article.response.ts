import * as Article from "./article";

interface ArticleResponse {
  readonly articles: Article.Type[];
  readonly articlesCount: number;
}

const empty: ArticleResponse = {
  articles: [],
  articlesCount: 0,
};

const fromArticles = (articles: Article.Type[]): ArticleResponse => ({
  articles,
  articlesCount: articles.length
});

export { empty, fromArticles };
