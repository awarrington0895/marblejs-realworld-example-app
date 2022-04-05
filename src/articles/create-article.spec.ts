import { CreateArticle } from "./create-article";
import * as E from "fp-ts/Either";

describe("CreateArticle", () => {
  it("should allow a valid CreateArticle", () => {
    const validCreateArticle: CreateArticle = {
      article: {
        title: "test",
        description: "my-description",
        body: "my body",
        tagList: ["tag1", "tag2"],
      },
    };

    const result = CreateArticle.decode(validCreateArticle);

    expect(E.isRight(result)).toBe(true);
  });

  it("should not allow an invalid CreateArticle", () => {
    const invalidCreateArticle = {
      title: "test",
      description: "my-description",
      body: "my body",
      tagList: ["tag1", "tag2"],
    };

    const result = CreateArticle.decode(invalidCreateArticle);

    expect(E.isRight(result)).toBe(false);
  });

  it("should allow an empty tag list", () => {
    const emptyTags = {
      article: {
        title: "test",
        description: "my-description",
        body: "my body",
        tagList: [],
      },
    };

    const result = CreateArticle.decode(emptyTags);

    expect(E.isRight(result)).toBe(true);
  });

  it.each([[undefined], [null]])("should be able to handle %s", input => {
    const result = CreateArticle.decode(input);

    expect(E.isRight(result)).toBe(false);
  });
});
