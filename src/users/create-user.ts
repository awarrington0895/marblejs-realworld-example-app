import { t } from "@marblejs/middleware-io";
import { Email } from "./email.brand";

const CreateUser = t.type({
  user: t.type({
    username: t.string,
    email: Email,
    password: t.string,
  }),
});

type CreateUser = t.TypeOf<typeof CreateUser>;

export { CreateUser };
