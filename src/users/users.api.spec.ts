import { PrismaConnectionToken } from "@conduit/db";
import { bindTo, createReader } from "@marblejs/core";
import { pipe } from "fp-ts/function";
import { useTestBedSetup } from "../test.setup";
import { HttpStatus } from "@marblejs/http";
import { map, Observable } from "rxjs";

jest.mock("@conduit/auth", () => ({
  __esModule: true,
  required$: (req$: Observable<any>) =>
    req$.pipe(
      map(req => {
        req.user = { id: 1 };
        return req;
      })
    ),
  optional$: (req$: Observable<any>) => req$,
  generateToken: () => "",
}));

const mockUserForRegister = {
  user: {
    username: "Jacob",
    email: "jake@jake.jake",
    password: "jakejake",
  },
};

const mockUser = {
  id: 1,
  email: "test@test.com",
  username: "al",
  password: "capone",
  image: null,
  bio: null,
};

describe("users", () => {
  const testBedSetup = useTestBedSetup();

  const bindDb = (mockDb: any) => {
    const dep = createReader(() => mockDb);

    return bindTo(PrismaConnectionToken)(dep);
  };

  test("GET / hello world", async () => {
    const { request } = await testBedSetup.useTestBed();

    const response = await pipe(
      request("GET"),
      request.withPath("/"),
      request.send
    );

    expect(response.statusCode).toBe(200);
  });

  test('POST "/api/users" creates a new user', async () => {
    const mockDb = {
      user: {
        create: jest.fn(),
      },
    };

    mockDb.user.create.mockResolvedValueOnce(mockUser);

    const { request } = await testBedSetup.useTestBed([bindDb(mockDb)]);

    const response = await pipe(
      request("POST"),
      request.withPath("/users"),
      request.withBody(mockUserForRegister),
      request.send
    );

    expect(response.statusCode).toBe(200);
  });

  test('GET "/user" retrieves current user', async () => {
    const mockDb = {
      user: {
        findUnique: jest.fn(),
      },
    };

    mockDb.user.findUnique.mockResolvedValueOnce(mockUser);

    const { request } = await testBedSetup.useTestBed([bindDb(mockDb)]);

    const response = await pipe(
      request("GET"),
      request.withPath("/user"),
      request.send
    );

    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  test('PUT "/user" updates the user record', async () => {
    const mockDb = {
      user: {
        update: jest.fn(),
      },
    };

    mockDb.user.update.mockResolvedValueOnce(mockUser);

    const { request } = await testBedSetup.useTestBed([bindDb(mockDb)]);

    const response = await pipe(
      request("PUT"),
      request.withPath("/user"),
      request.withBody({
        user: {
          username: "test",
        },
      }),
      request.send
    );

    expect(response.body).toEqual({
      user: {
        email: mockUser.email,
        username: mockUser.username,
        token: "",
      },
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterEach(async () => {
    await testBedSetup.cleanup();
  });
});
