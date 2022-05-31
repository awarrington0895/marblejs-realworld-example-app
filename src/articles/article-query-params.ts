import { t } from "@marblejs/middleware-io";

export const ArticleQueryParams = t.partial({
  author: t.string,
});

export type ArticleQueryParams = t.TypeOf<typeof ArticleQueryParams>;
