import { combineRoutes, r } from "@marblejs/http";
import { map, mergeMap, pluck } from "rxjs/operators";
import { createUser$ } from "./user.effect";
import { authorize$, generateToken } from "@conduit/auth";
import { useContext } from "@marblejs/core";
import { PrismaConnectionToken } from "@conduit/db";
import * as db from "./users.db";
import { errIfEmpty, mapToBody } from "@conduit/util";
import * as F from "fp-ts/function";
import { User } from "@prisma/client";
import { UserDto } from "./user.dto";

const toUserDto = (user: User): UserDto => ({
  user: {
    email: user.email,
    username: user.username,
    token: generateToken({ id: user.id }),
  },
});

const getCurrentUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("GET"),
  r.use(authorize$),
  r.useEffect((req$, ctx) => {
    const connection = useContext(PrismaConnectionToken)(ctx.ask);

    return req$.pipe(
      pluck("user", "id"),
      mergeMap(F.pipe(connection, db.findById$)),
      errIfEmpty(),
      map(toUserDto),
      mapToBody()
    );
  })
);

const registerUser$ = r.pipe(
  r.matchPath("/"),
  r.matchType("POST"),
  r.useEffect(createUser$)
);

const usersApi$ = combineRoutes("/users", {
  effects: [registerUser$],
});

export { getCurrentUser$, usersApi$ };
