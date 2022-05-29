import { t } from "@marblejs/middleware-io";
import { Email } from "./email.brand";

const LoginUser = t.type({
  user: t.type({
    email: Email,
    password: t.string,
  }),
});

type LoginUser = t.TypeOf<typeof LoginUser>;

export { LoginUser };
