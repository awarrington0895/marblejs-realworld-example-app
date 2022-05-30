import * as fDate from "fp-ts/lib/Date";
import * as O from "fp-ts/lib/Option";
import { Article as PrismaArticleModel } from "@prisma/client";
import { pipe } from "fp-ts/lib/function";

const empty: Article = {
  slug: "empty",
  title: "",
  description: "",
  body: "",
  createdAt: fDate.create(),
  updatedAt: fDate.create(),
  favorited: false,
  favoritesCount: 0,
  tagList: [],
  author: {
    username: "",
  },
};

interface Article {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly body: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly favorited: boolean;
  readonly favoritesCount: number;
  readonly tagList: string[];
  readonly author: {
    username: string;
  };
}

type ArticleModel = PrismaArticleModel & {
  author?: {
    username: string;
  };
};

const fromArticleModel = (model: ArticleModel): Article => {
  return {
    slug: model.slug,
    title: model.title,
    description: model.description,
    body: model.body,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    favorited: model.favorited,
    tagList: model.tagList,
    author: model.author,
  } as Article;
};

const fromNullableArticleModel = (
  model: ArticleModel | null
): O.Option<Article> => {
  return pipe(O.fromNullable(model), O.map(fromArticleModel));
};

export { empty, Article as Type, fromNullableArticleModel, fromArticleModel };
