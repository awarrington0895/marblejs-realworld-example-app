import { isRight } from "fp-ts/lib/Either";
import { CreateUser } from "./create-user";

describe("CreateUser", () => {
  it("should allow a valid create-user model", () => {
    const createUser = {
      user: {
        username: "alex",
        email: "alex@test.com",
        password: "secure",
      },
    };

    const result = CreateUser.decode(createUser);

    expect(isRight(result)).toBe(true);
  });

  it("should enforce that email is a valid email", () => {
    const createUser = {
      user: {
        username: "alex",
        email: "email-with-no-at-symbol",
        password: "secure",
      },
    };

    const result = CreateUser.decode(createUser);

    expect(isRight(result)).toBe(false);
  });

  it("should not allow an invalid model", () => {
    const createUser = {
      user: {
        username: 123,
        email: "test",
      },
    };

    const result = CreateUser.decode(createUser);

    expect(isRight(result)).toBe(false);
  });
});
