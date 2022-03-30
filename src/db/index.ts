import { createContextToken, createReader } from "@marblejs/core";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PrismaConnectionToken = createContextToken<PrismaClient>(
  "PrismaConnectionToken"
);

const PrismaConnection = createReader(() => prisma);

export { PrismaConnectionToken, PrismaConnection };
