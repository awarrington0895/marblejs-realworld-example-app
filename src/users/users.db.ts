import { Prisma, PrismaClient, User } from "@prisma/client";
import { Observable, defer, from, mergeMap, throwError, of } from "rxjs";
import { map } from "rxjs/operators";
import { CreateUser } from "./create-user";
import bcrypt from "bcryptjs";
import { RegisteredUser } from "./registered-user";
import * as O from "fp-ts/Option";
import { LoginUser } from "./login-user";

const findById$ =
  (prisma: PrismaClient) =>
  (id: number): Observable<O.Option<User>> => {
    return defer(() =>
      prisma.user.findUnique({
        where: { id },
      })
    ).pipe(map(O.fromNullable));
  };

const findByUsername$ =
  (prisma: PrismaClient) =>
  (username: string): Observable<O.Option<User>> => {
    return defer(() =>
      prisma.user.findUnique({
        where: {
          username,
        },
      })
    ).pipe(map(O.fromNullable));
  };

const findByEmail$ =
  (prisma: PrismaClient) =>
  (email: string): Observable<O.Option<User>> => {
    return defer(() => prisma.user.findUnique({ where: { email } })).pipe(
      map(O.fromNullable)
    );
  };

const login$ =
  (prisma: PrismaClient) =>
  (loginUser: LoginUser): Observable<User> => {
    const email = loginUser.user.email.toString();

    return defer(() => prisma.user.findUnique({ where: { email } })).pipe(
      mergeMap((user: User | null) => {
        if (
          user === null ||
          !bcrypt.compareSync(loginUser.user.password, user?.password)
        ) {
          return throwError(() => new Error("Invalid username or password!"));
        }

        return of(user);
      })
    );
  };

const createUser$ =
  (prisma: PrismaClient) =>
  (user: CreateUser): Observable<User> => {
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
          })
        )
      )
    );
  };

export { createUser$, findById$, findByUsername$, findByEmail$, login$ };
