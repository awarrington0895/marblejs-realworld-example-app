import { createServer, httpListener, r } from "@marblejs/http";
import { bodyParser$ } from "@marblejs/middleware-body";
import { logger$ } from "@marblejs/middleware-logger";
import { IO } from "fp-ts/lib/IO";
import { map } from "rxjs/operators";
import { articlesApi$ } from "@conduit/articles";
import { bindEagerlyTo } from "@marblejs/core";
import { PrismaConnectionToken, PrismaConnection } from "@conduit/db";
import { getCurrentUser$ } from "@conduit/users";
import { usersApi$ } from "./users/users.api";

const helloWorld$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.useEffect(req$ => req$.pipe(map(() => ({ body: "Hello, world!" }))))
);

const middlewares = [logger$(), bodyParser$()];

const effects = [helloWorld$, articlesApi$, getCurrentUser$, usersApi$];

const listener = httpListener({
  middlewares,
  effects,
});

const server = createServer({
  port: 1337,
  hostname: "127.0.0.1",
  listener,
  dependencies: [bindEagerlyTo(PrismaConnectionToken)(PrismaConnection)],
});

const main: IO<void> = async () => await (await server)();

main();
