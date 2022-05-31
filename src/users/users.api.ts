import { combineRoutes, HttpError, HttpStatus, r } from "@marblejs/http";
import { catchError, map, mergeMap, pluck } from "rxjs/operators";
import * as auth from "@conduit/auth";
import {
  LoggerLevel,
  LoggerTag,
  LoggerToken,
  useContext,
} from "@marblejs/core";
import { PrismaConnectionToken } from "@conduit/db";
import * as db from "./users.db";
import { errIfEmpty, mapToBody } from "@conduit/util";
import * as F from "fp-ts/function";
import { User } from "@prisma/client";
import { UserDto } from "./user.dto";
import { CreateUser } from "./create-user";
import { requestValidator$ } from "@marblejs/middleware-io";
import { LoginUser } from "./login-user";
import { throwError, of } from "rxjs";
import { UpdateUser } from "./update-user";

const toUserDto = (user: User): UserDto => {
  const dto: UserDto = {
    user: {
      email: user.email,
      username: user.username,
      token: auth.generateToken({ id: user.id, username: user.username }),
      image: user.image ? user.image : "",
    },
  };

  if (user.bio) {
    dto.user.bio = user.bio;
  }

  return dto;
};

const getCurrentUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("GET"),
  r.use(auth.required$),
  r.useEffect((req$, ctx) => {
    const connection = useContext(PrismaConnectionToken)(ctx.ask);

    return req$.pipe(
      pluck("user", "username"),
      mergeMap(F.pipe(connection, db.findByUsername$)),
      errIfEmpty(),
      map(toUserDto),
      mapToBody()
    );
  })
);

const registerUser$ = r.pipe(
  r.matchPath("/"),
  r.matchType("POST"),
  r.useEffect((req$, { ask }) => {
    const prismaClient = useContext(PrismaConnectionToken)(ask);

    return req$.pipe(
      requestValidator$({ body: CreateUser }),
      map(req => req.body as CreateUser),
      mergeMap(F.pipe(prismaClient, db.createUser$)),
      map(toUserDto),
      mapToBody()
    );
  })
);

const login$ = r.pipe(
  r.matchPath("/login"),
  r.matchType("POST"),
  r.useEffect((req$, { ask }) => {
    const prismaClient = useContext(PrismaConnectionToken)(ask);
    const logger = useContext(LoggerToken)(ask);

    return req$.pipe(
      requestValidator$({ body: LoginUser }),
      map(req => req.body as LoginUser),
      mergeMap(F.pipe(prismaClient, db.login$)),
      map(toUserDto),
      mapToBody(),
      catchError(err => {
        const log = logger({
          tag: LoggerTag.CORE,
          level: LoggerLevel.ERROR,
          type: "login$",
          message: err.message,
        });

        log();

        return throwError(() => err);
      })
    );
  })
);

const updateUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("PUT"),
  r.use(auth.required$),
  r.useEffect((req$, { ask }) => {
    const prismaClient = useContext(PrismaConnectionToken)(ask);
    const logger = useContext(LoggerToken)(ask);

    return req$.pipe(
      requestValidator$({ body: UpdateUser }),
      mergeMap(req => {
        if (!Object.keys(req.body.user).length) {
          const log = logger({
            tag: LoggerTag.HTTP,
            level: LoggerLevel.ERROR,
            type: "updateUser$",
            message: `UpdateUser received contained no fields to update. UpdateUser=${req.body}`,
          });

          log();

          return throwError(
            () =>
              new HttpError(
                "Input must contain at least one field!",
                HttpStatus.BAD_REQUEST,
                { input: req.body }
              )
          );
        }

        return of(req);
      }),
      mergeMap(req =>
        db.updateUser$(prismaClient)(req.user.username, req.body)
      ),
      map(toUserDto),
      mapToBody()
    );
  })
);

const usersApi$ = combineRoutes("/users", {
  effects: [registerUser$, login$],
});

export { getCurrentUser$, usersApi$, updateUser$ };
