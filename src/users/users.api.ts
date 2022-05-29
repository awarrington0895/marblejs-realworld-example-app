import { combineRoutes, r } from "@marblejs/http";
import { map, mergeMap, pluck } from "rxjs/operators";
import * as auth from "@conduit/auth";
import { useContext } from "@marblejs/core";
import { PrismaConnectionToken } from "@conduit/db";
import * as db from "./users.db";
import { errIfEmpty, mapToBody } from "@conduit/util";
import * as F from "fp-ts/function";
import { User } from "@prisma/client";
import { UserDto } from "./user.dto";
import { CreateUser } from "./create-user";
import { requestValidator$ } from "@marblejs/middleware-io";

const toUserDto = (user: User): UserDto => ({
  user: {
    email: user.email,
    username: user.username,
    token: auth.generateToken({ id: user.id }),
  },
});

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

const usersApi$ = combineRoutes("/users", {
  effects: [registerUser$],
});

export { getCurrentUser$, usersApi$ };
