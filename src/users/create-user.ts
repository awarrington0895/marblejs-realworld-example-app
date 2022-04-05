import { t } from "@marblejs/middleware-io";

const CreateUser = t.type({
  user: t.type({
    username: t.string,
    email: t.string,
    password: t.string,
  }),
});

type CreateUser = t.TypeOf<typeof CreateUser>;

export { CreateUser };
