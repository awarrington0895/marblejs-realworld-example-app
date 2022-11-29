import {
  LoggerLevel,
  LoggerTag,
  LoggerToken,
  useContext,
} from "@marblejs/core";
import { combineRoutes, r } from "@marblejs/http";
import { requestValidator$ } from "@marblejs/middleware-io";
import { User } from "@prisma/client";
import { throwError } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";

import * as auth from "@conduit/auth";
import { errIfEmpty, mapToBody } from "@conduit/util";
import { CreateUser } from "./create-user";
import { LoginUser } from "./login-user";
import { UpdateUser } from "./update-user";
import { UserDto } from "./user.dto";
import { UserServiceToken } from "./users.service";

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
    const users = useContext(UserServiceToken)(ctx.ask);

    return req$.pipe(
      map(req => req.user?.username),
      mergeMap(users.findByUsername$),
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
    const users = useContext(UserServiceToken)(ask);

    return req$.pipe(
      requestValidator$({ body: CreateUser }),
      map(req => req.body as CreateUser),
      mergeMap(users.createUser$),
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
    const users = useContext(UserServiceToken)(ask);

    return req$.pipe(
      requestValidator$({ body: UpdateUser }),
      map(req => ({
        userId: req.user.id,
        updateUser: req.body as UpdateUser,
      })),
      mergeMap(({ userId, updateUser }) =>
        users.updateUser$(userId, updateUser)
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
    const users = useContext(UserServiceToken)(ask);
    const logger = useContext(LoggerToken)(ask);

    return req$.pipe(
      requestValidator$({ body: LoginUser }),
      map(req => req.body as LoginUser),
      mergeMap(users.login$),
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
