import { t } from "@marblejs/middleware-io";
import validator from "validator";

interface EmailBrand {
  readonly Email: unique symbol;
}

export const Email = t.brand(
  t.string,
  (str): str is t.Branded<string, EmailBrand> => validator.isEmail(str),
  "Email"
);
