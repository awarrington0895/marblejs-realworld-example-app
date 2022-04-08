import { PrismaClient } from "@prisma/client";
import { Observable, defer, from, mergeMap } from "rxjs";
import { CreateUser } from "./create-user";
import bcrypt from "bcryptjs";
import { RegisteredUser } from "./registered-user";

const createUser$ =
  (prisma: PrismaClient) =>
  (user: CreateUser): Observable<RegisteredUser> => {
    const {
      user: { username, email, password },
    } = user;

    const hash$ = defer(() => bcrypt.hash(password, 10));

    return hash$.pipe(
      mergeMap(hash =>
        from(
          prisma.user.create({
            data: {
              username,
              email,
              password: hash,
            },
            select: {
              username: true,
              email: true,
            },
          })
        )
      )
    );
  };

export { createUser$ };
