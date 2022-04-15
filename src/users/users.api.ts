import { combineRoutes, r } from "@marblejs/http";
import { mergeMap, pluck } from "rxjs/operators";
import { createUser$ } from "./user.effect";
import { authorize$ } from "@conduit/auth";
import { useContext } from "@marblejs/core";
import { PrismaConnectionToken } from "@conduit/db";
import * as db from "./users.db";
import { errIfEmpty, mapToBody } from "@conduit/util";

const getCurrentUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("GET"),
  r.use(authorize$),
  r.useEffect((req$, ctx) => {
    const connection = useContext(PrismaConnectionToken)(ctx.ask);

    return req$.pipe(
      pluck("user"),
      mergeMap(user => db.findById$(connection)(user.id)),
      errIfEmpty(),
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
