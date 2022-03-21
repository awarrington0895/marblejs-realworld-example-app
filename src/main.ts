import { createServer, httpListener, r } from "@marblejs/http";
import { bodyParser$ } from "@marblejs/middleware-body";
import { logger$ } from "@marblejs/middleware-logger";
import { IO } from "fp-ts/lib/IO";
import { map } from "rxjs/operators";
import { articlesApi$ } from "@conduit/articles";

const api$ = r.pipe(
  r.matchPath("/"),
  r.matchType("GET"),
  r.useEffect((req$) => req$.pipe(map(() => ({ body: "Hello, world!" }))))
);

const middlewares = [logger$(), bodyParser$()];

const effects = [api$, articlesApi$];

const listener = httpListener({
  middlewares,
  effects,
});

const server = createServer({
  port: 1337,
  hostname: "127.0.0.1",
  listener,
});

const main: IO<void> = async () => await (await server)();

main();
