import { PrismaClient, User } from "@prisma/client";
import { Observable, defer, from, mergeMap } from "rxjs";
import { map } from "rxjs/operators";
import { CreateUser } from "./create-user";
import bcrypt from "bcryptjs";
import { RegisteredUser } from "./registered-user";
import * as O from "fp-ts/Option";

const findById$ =
  (prisma: PrismaClient) =>
  (id: number): Observable<O.Option<User>> => {
    return defer(() =>
      prisma.user.findUnique({
        where: { id },
      })
    ).pipe(map(O.fromNullable));
  };

const createUser$ =
  (prisma: PrismaClient) =>
  (user: CreateUser): Observable<RegisteredUser> => {
    const {
      user: { username, email, password },
    } = user;

    return defer(() => bcrypt.hash(password, 10)).pipe(
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

export { createUser$, findById$ };
