import { PrismaConnectionToken } from "@conduit/db";
import { bindEagerlyTo, bindTo, createReader } from "@marblejs/core";
import { createHttpTestBed, createTestBedSetup } from "@marblejs/testing";
import { PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";
import { listener } from "./http.listener";
import { prismaMock } from "./singleton";

const testBed = createHttpTestBed({
  listener,
});

// prismaMock.user.findMany.mockResolvedValue([]);

const mockDb = {};

const mockPrismaReader = createReader(() => mockDb);

export const useTestBedSetup = createTestBedSetup({
  // testBed
  testBed,
  dependencies: [bindTo(PrismaConnectionToken)(mockPrismaReader)],
});
