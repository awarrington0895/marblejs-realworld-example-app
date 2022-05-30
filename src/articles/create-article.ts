import { t } from "@marblejs/middleware-io";

const _CreateArticle = t.type({
  article: t.type({
    title: t.string,
    description: t.string,
    body: t.string,
    tagList: t.array(t.string),
  }),
});

export const CreateArticle = t.exact(_CreateArticle);

export type CreateArticle = t.TypeOf<typeof CreateArticle>;
