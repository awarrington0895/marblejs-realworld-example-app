import "@relmify/jest-fp-ts";

import { UpdateUser } from "./update-user";

describe("UpdateUser", () => {
  given("Update user is empty", () => {
    const updateUser = {
      user: {},
    };

    when("it is decoded", () => {
      const result = UpdateUser.decode(updateUser);

      then("it should be an error", () => {
        expect(result).toBeLeft();
      });
    });
  });

  given("Update user contains a single value", () => {
    const updateUser = {
      user: {
        username: "myusername",
      },
    };

    when("it is decoded", () => {
      const result = UpdateUser.decode(updateUser);

      then("it should be a success", () => {
        expect(result).toBeRight();
      });
    });
  });
});
