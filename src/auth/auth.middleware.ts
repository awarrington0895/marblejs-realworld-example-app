import { iif, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { pipe } from "fp-ts/function";
import config from "./config";
import * as O from "fp-ts/Option";

import { authorize$ as jwt$ } from "@marblejs-contrib/middleware-jwt";
import { HttpMiddlewareEffect, HttpRequest } from "@marblejs/http";

const verifyPayload$ = (payload: unknown) =>
  of(payload as Record<string, unknown>);

const splitHeader = (header: string): string[] => header.split(" ");

const getLastElement = (array: string[]): string => array[array.length - 1];

const parseAuthorizationHeader = (req: HttpRequest) =>
  pipe(
    O.fromNullable(req.headers.authorization),
    O.map(splitHeader),
    O.map(getLastElement),
    O.getOrElse(() => "")
  );

const required$ = jwt$(config, verifyPayload$);

const optional$: HttpMiddlewareEffect = (req$, ctx) =>
  req$.pipe(
    mergeMap(req =>
      of(req).pipe(
        map(parseAuthorizationHeader),
        mergeMap(token =>
          iif(() => token === "", of(req), required$(of(req), ctx))
        )
      )
    )
  );

export { required$, optional$ };
