import { t } from "@marblejs/middleware-io";

export const UpdateArticle = t.type({
  article: t.partial({
    title: t.string,
    description: t.string,
    body: t.string,
  }),
});

export type UpdateArticle = t.TypeOf<typeof UpdateArticle>;
