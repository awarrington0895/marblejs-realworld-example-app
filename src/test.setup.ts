import { PrismaConnectionToken } from "@conduit/db";
import { bindEagerlyTo, bindTo, createReader } from "@marblejs/core";
import { createHttpTestBed, createTestBedSetup } from "@marblejs/testing";
import { listener } from "./http.listener";
import { UserServiceReader, UserServiceToken } from "./users";

const testBed = createHttpTestBed({
  listener,
  defaultHeaders: {
    Authorization: "Bearer token",
  },
});

const mockDb = {};

const mockPrismaReader = createReader(() => mockDb);

export const useTestBedSetup = createTestBedSetup({
  testBed,
  dependencies: [
    bindTo(PrismaConnectionToken)(mockPrismaReader),
    bindTo(UserServiceToken)(UserServiceReader),
  ],
});
