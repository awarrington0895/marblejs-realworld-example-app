import { createContextToken, createReader } from "@marblejs/core";
import { PrismaClient } from "@prisma/client";

const PrismaConnectionToken = createContextToken<PrismaClient>(
  "PrismaConnectionToken"
);

const PrismaConnection = createReader(() => new PrismaClient());

export { PrismaConnectionToken, PrismaConnection };
