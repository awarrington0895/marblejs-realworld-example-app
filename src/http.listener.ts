import { r, httpListener } from "@marblejs/http";
import { bodyParser$ } from "@marblejs/middleware-body";
import { logger$ } from "@marblejs/middleware-logger";
import { map } from "rxjs";

import { articlesApi$ } from "@conduit/articles";
import { getCurrentUser$, usersApi$, updateUser$ } from "@conduit/users";

const helloWorld$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.useEffect(req$ => req$.pipe(map(() => ({ body: "Hello, world!" }))))
);

const middlewares = [logger$(), bodyParser$()];

const effects = [
  helloWorld$,
  articlesApi$,
  getCurrentUser$,
  usersApi$,
  updateUser$,
];

export default httpListener({
  middlewares,
  effects,
});
