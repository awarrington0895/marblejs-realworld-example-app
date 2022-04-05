import { t } from "@marblejs/middleware-io";

export const CreateArticle = t.type({
  article: t.type({
    title: t.string,
    description: t.string,
    body: t.string,
    tagList: t.array(t.string),
  }),
});

export type CreateArticle = t.TypeOf<typeof CreateArticle>;
