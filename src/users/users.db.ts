import { isDefined } from "@conduit/util";
import { HttpError, HttpStatus } from "@marblejs/http";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as O from "fp-ts/Option";
import { defer, from, mergeMap, Observable, of, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { CreateUser } from "./create-user";
import { LoginUser } from "./login-user";
import { UpdateUser } from "./update-user";

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
          !bcrypt.compareSync(loginUser.user.password, user.password)
        ) {
          return throwError(
            () =>
              new HttpError(
                `Invalid email or password! email=${email}`,
                HttpStatus.UNAUTHORIZED,
                { email }
              )
          );
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

const updateUser$ =
  (prisma: PrismaClient) =>
  (id: number, updateUser: UpdateUser): Observable<User> => {
    const { user } = updateUser;
    const password = user.password;

    if (isDefined(password)) {
      return defer(() => bcrypt.hash(password, 10)).pipe(
        mergeMap(hash =>
          from(
            prisma.user.update({
              where: {
                id,
              },
              data: {
                ...user,
                password: hash,
              },
            })
          )
        )
      );
    }

    return defer(() =>
      prisma.user.update({
        where: {
          id,
        },
        data: {
          ...user,
        },
      })
    );
  };

export {
  createUser$,
  updateUser$,
  findById$,
  findByUsername$,
  findByEmail$,
  login$,
};
