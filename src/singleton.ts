import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from "./test-client";

jest.mock("./test-client", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>({ funcPropSupport: true }),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
