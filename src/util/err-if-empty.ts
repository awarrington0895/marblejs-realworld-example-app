import { HttpError, HttpStatus } from "@marblejs/http";
import { pipe, mergeMap, of, throwError } from "rxjs";
import * as O from "fp-ts/Option";
import * as F from "fp-ts/function";

export const errIfEmpty = <T>() =>
  pipe(
    mergeMap((opt: O.Option<T>) => {
      return F.pipe(
        opt,
        O.map(of),
        O.getOrElse(() =>
          throwError(
            () => new HttpError("Resource not found", HttpStatus.NOT_FOUND)
          )
        )
      );
    })
  );
