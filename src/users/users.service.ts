import { PrismaConnectionToken } from "@conduit/db";
import { isDefined } from "@conduit/util";
import { createContextToken, createReader, useContext } from "@marblejs/core";
import { HttpError, HttpStatus } from "@marblejs/http";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Option, fromNullable } from "fp-ts/Option";
import { defer, mergeMap, Observable, of, throwError, from } from "rxjs";
import { map } from "rxjs/operators";
import { CreateUser } from "./create-user";
import { LoginUser } from "./login-user";
import { UpdateUser } from "./update-user";

const mapNullable = map(fromNullable);

const createUserService = (prisma: PrismaClient) => {
  const findBy = (search: Partial<User>) =>
    defer(() => prisma.user.findUnique({ where: { ...search } }));

  return {
    findById$(id: number): Observable<Option<User>> {
      return findBy({ id }).pipe(mapNullable);
    },

    findByUsername$(username: string): Observable<Option<User>> {
      return findBy({ username }).pipe(mapNullable);
    },

    findByEmail$(email: string): Observable<Option<User>> {
      return findBy({ email }).pipe(mapNullable);
    },

    login$(loginUser: LoginUser): Observable<User> {
      const email = loginUser.user.email.toString();

      return findBy({ email }).pipe(
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

      const baseUpdate = {
        where: { id },
        data: {
          ...user,
        },
      };

      return defer(() => {
        if (isDefined(password)) {
          return from(bcrypt.hash(password, 10)).pipe(
            mergeMap(hash =>
              prisma.user.update({
                ...baseUpdate,
                data: {
                  ...user,
                  password: hash,
                },
              })
            )
          );
        }

        return prisma.user.update(baseUpdate);
      });
    },
  };
};
const UserServiceToken =
  createContextToken<ReturnType<typeof createUserService>>("UserService");

const UserServiceReader = createReader(ask => {
  const prismaClient = useContext(PrismaConnectionToken)(ask);

  return createUserService(prismaClient);
});

export { UserServiceToken, UserServiceReader };
