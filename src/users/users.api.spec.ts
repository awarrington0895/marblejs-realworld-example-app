import { PrismaConnectionToken } from "@conduit/db";
import {
  bindEagerlyTo,
  bindTo,
  createReader,
  useContext,
} from "@marblejs/core";
import { PrismaClient, User } from "@prisma/client";
import { pipe } from "fp-ts/function";
import { Reader } from "fp-ts/lib/Reader";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { prismaMock } from "../singleton";
import { useTestBedSetup } from "../test.setup";

const mockUserForRegister = {
  user: {
    username: "Jacob",
    email: "jake@jake.jake",
    password: "jakejake",
  },
};

describe("users", () => {
  const testBedSetup = useTestBedSetup();

  // const mockPrismaReader = createReader(() => prismaMock);

  test("GET / hello world", async () => {
    // const deps = [
    //     bindEagerlyTo(PrismaConnectionToken)(async () => mockPrismaReader)
    // ]
    const { request } = await testBedSetup.useTestBed();

    const response = await pipe(
      request("GET"),
      request.withPath("/"),
      request.send
    );

    expect(response.statusCode).toBe(200);

    // await finish();
  });

  test('POST "/api/users" creates a new user', async () => {
    const { request, ask } = await testBedSetup.useTestBed();

    const prismaClient = useContext(PrismaConnectionToken)(
      ask
    ) as DeepMockProxy<PrismaClient>;

    const mockCreatedUser = {
      id: 1,
      email: "test@test.com",
      username: "al",
      password: "capone",
      image: null,
      bio: null,
    };

    prismaClient.user.create.mockResolvedValueOnce(mockCreatedUser);

    const response = await pipe(
      request("POST"),
      request.withPath("/users"),
      request.withBody(mockUserForRegister),
      request.send
    );

    expect(response.statusCode).toBe(200);
  });

  afterEach(async () => {
    await testBedSetup.cleanup();
  });
});
