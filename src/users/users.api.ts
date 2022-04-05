import { combineRoutes, r } from "@marblejs/http";
import { map } from "rxjs/operators";
import { createUser$ } from "./user.effect";

const getCurrentUser$ = r.pipe(
  r.matchPath("/user"),
  r.matchType("GET"),
  r.useEffect(req$ =>
    req$.pipe(map(() => ({ body: { user: { email: "alex@example.com" } } })))
  )
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
