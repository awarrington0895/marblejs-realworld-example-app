import {
  LoggerLevel,
  LoggerTag,
  LoggerToken,
  useContext,
} from "@marblejs/core";
import { requestValidator$ } from "@marblejs/middleware-io";
import { combineRoutes, r } from "@marblejs/http";
import { throwError } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { User } from "@prisma/client";
import * as F from "fp-ts/function";

import * as auth from "@conduit/auth";
import { errIfEmpty, mapToBody } from "@conduit/util";
import { PrismaConnectionToken } from "@conduit/db";
import * as db from "./users.db";
import { UserDto } from "./user.dto";
import { CreateUser } from "./create-user";
import { LoginUser } from "./login-user";
import { UpdateUser } from "./update-user";

const toUserDto = (user: User): UserDto => ({
  user: {
    email: user.email,
    username: user.username,
    token: auth.generateToken({ id: user.id, username: user.username }),
  },
});

const getCurrentUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("GET"),
  r.use(auth.required$),
  r.useEffect((req$, ctx) => {
    const connection = useContext(PrismaConnectionToken)(ctx.ask);

    return req$.pipe(
      map(req => req.user?.username),
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

const updateUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("PUT"),
  r.use(auth.required$),
  r.useEffect((req$, { ask }) => {
    const connection = useContext(PrismaConnectionToken)(ask);

    return req$.pipe(
      requestValidator$({ body: UpdateUser }),
      map(req => ({
        userId: req.user.id,
        updateUser: req.body as UpdateUser,
      })),
      mergeMap(({ userId, updateUser }) =>
        db.updateUser$(connection)(userId, updateUser)
      ),
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

const usersApi$ = combineRoutes("/users", {
  effects: [registerUser$, login$],
});

export { getCurrentUser$, updateUser$, usersApi$ };
