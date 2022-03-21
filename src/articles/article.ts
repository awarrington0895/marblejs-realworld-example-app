import * as fDate from "fp-ts/lib/Date";

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
  author: { username: "" },
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
  readonly author: { username: string };
}

export { empty, Article as Type };
