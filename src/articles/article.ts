import { IO } from "fp-ts/lib/IO";
import * as fDate from "fp-ts/lib/Date";

const empty: Article = {
  slug: "",
  title: "",
  description: "",
  body: "",
  createdAt: fDate.create(),
  updatedAt: fDate.create(),
  favorited: false,
  favoritesCount: 0,
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
}

export { empty, Article as Type };
