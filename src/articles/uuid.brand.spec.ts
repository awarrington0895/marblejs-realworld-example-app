import { UUID } from "./uuid.brand";
import { isRight } from "fp-ts/lib/Either";

describe("UUID Brand", () => {
  const validUUID = "b16d4c1c-1f96-4f5f-8394-4c83629db548";
  const invalidUUID = "totally-not_valid";

  it("should pass a valid uuid", () => {
    const result = UUID.decode(validUUID);

    expect(isRight(result)).toBe(true);
  });

  it("should throw an error for an invalid UUID", () => {
    const result = UUID.decode(invalidUUID);

    expect(isRight(result)).toBe(false);
  });
});
