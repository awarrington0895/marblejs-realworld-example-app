import { t } from "@marblejs/middleware-io";

export const UpdateUser = t.type({
  user: t.partial({
    email: t.string,
    bio: t.string,
    image: t.string,
    username: t.string,
    password: t.string,
  }),
});

export type UpdateUser = t.TypeOf<typeof UpdateUser>;
