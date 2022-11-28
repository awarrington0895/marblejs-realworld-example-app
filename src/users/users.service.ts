import { PrismaConnectionToken } from "@conduit/db";
import { isDefined } from "@conduit/util";
import { createContextToken, createReader, useContext } from "@marblejs/core";
import { HttpError, HttpStatus } from "@marblejs/http";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as O from "fp-ts/Option";
import { defer, mergeMap, Observable, of, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { CreateUser } from "./create-user";
import { LoginUser } from "./login-user";
import { UpdateUser } from "./update-user";

const mapNullable = map(O.fromNullable);

const createUserService = (prisma: PrismaClient) => ({
  findById$(id: number): Observable<O.Option<User>> {
    return defer(() =>
      prisma.user.findUnique({
        where: { id },
      })
    ).pipe(mapNullable);
  },

  findByUsername$(username: string): Observable<O.Option<User>> {
    return defer(() =>
      prisma.user.findUnique({
        where: {
          username,
        },
      })
    ).pipe(mapNullable);
  },

  findByEmail$(email: string): Observable<O.Option<User>> {
    return defer(() =>
      prisma.user.findUnique({
        where: { email },
      })
    ).pipe(mapNullable);
  },

  login$(loginUser: LoginUser): Observable<User> {
    const email = loginUser.user.email.toString();

    const user$ = defer(() => prisma.user.findUnique({ where: { email } }));

    return user$.pipe(
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
  },

  createUser$(user: CreateUser): Observable<User> {
    const {
      user: { username, email, password },
    } = user;

    return defer(() => bcrypt.hash(password, 10)).pipe(
      mergeMap(hash =>
        prisma.user.create({
          data: {
            username,
            email,
            password: hash,
          },
        })
      )
    );
  },

  updateUser$(id: number, updateUser: UpdateUser): Observable<User> {
    const { user } = updateUser;
    const password = user.password;

    if (isDefined(password)) {
      return defer(() => bcrypt.hash(password, 10)).pipe(
        mergeMap(hash =>
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
      );
    }

    return defer(() =>
      prisma.user.update({
        where: { id },
        data: {
          ...user,
        },
      })
    );
  },
});
const UserServiceToken =
  createContextToken<ReturnType<typeof createUserService>>("UserService");

const UserServiceReader = createReader(ask => {
  const prismaClient = useContext(PrismaConnectionToken)(ask);

  return createUserService(prismaClient);
});

export { UserServiceToken, UserServiceReader };
