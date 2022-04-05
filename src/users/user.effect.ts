import { PrismaConnectionToken } from "@conduit/db";
import { EffectContext, useContext } from "@marblejs/core";
import { HttpEffect, HttpServer } from "@marblejs/http";
import { requestValidator$ } from "@marblejs/middleware-io";
import { SchedulerLike, map, mergeMap, pipe } from "rxjs";
import { CreateUser } from "./create-user";
import * as db from "./users.db";
import * as F from "fp-ts/function";

const mapToBody = () => pipe(map(x => ({ body: x })));

const validateCreateUser = requestValidator$({
  body: CreateUser,
});

export const createUser$: HttpEffect = (
  req$,
  ctx: EffectContext<HttpServer, SchedulerLike>
) =>
  req$.pipe(
    validateCreateUser,
    map(req => req.body as CreateUser),
    mergeMap(
      F.pipe(useContext(PrismaConnectionToken)(ctx.ask), db.createUser$)
    ),
    map(createdUser => ({ user: createdUser })),
    mapToBody()
  );
