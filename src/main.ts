import { PrismaConnection, PrismaConnectionToken } from "@conduit/db";
import { bindEagerlyTo, bindTo } from "@marblejs/core";
import { createServer } from "@marblejs/http";
import { IO } from "fp-ts/lib/IO";
import { listener } from "./http.listener";
import { UserServiceReader, UserServiceToken } from "@conduit/users";
import { ArticleServiceToken, ArticleServiceReader } from "@conduit/articles";

const server = createServer({
  port: 1337,
  hostname: "127.0.0.1",
  listener,
  dependencies: [
    bindEagerlyTo(PrismaConnectionToken)(PrismaConnection),
    bindTo(UserServiceToken)(UserServiceReader),
    bindTo(ArticleServiceToken)(ArticleServiceReader),
  ],
});

const main: IO<void> = async () => await (await server)();

main();
