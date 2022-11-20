import { t } from "@marblejs/middleware-io";
import { Email } from "./email.brand";

const partialUser = t.exact(
  t.partial({
    email: Email,
    username: t.string,
    password: t.string,
  })
);

type PartialUser = t.TypeOf<typeof partialUser>;

interface AtLeastOneBrand {
  readonly AtLeastOne: unique symbol;
}

const AtLeastOneUserProperty = t.brand(
  partialUser,
  (user): user is t.Branded<PartialUser, AtLeastOneBrand> =>
    JSON.stringify(user) !== JSON.stringify({}),
  "AtLeastOne"
);

const UpdateUser = t.type({
  user: AtLeastOneUserProperty,
});

type UpdateUser = t.TypeOf<typeof UpdateUser>;

export { UpdateUser };
