import { HttpEffect } from "@marblejs/http";
import { pipe } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { getAllArticles$ } from "./articles.db";

const mapToBody = () => pipe(map((x) => ({ body: x })));

export const articles$: HttpEffect = (req$) =>
  req$.pipe(
    mergeMap(getAllArticles$),
    map((articles) => ({ articles, articlesCount: articles.length })),
    mapToBody()
  );
