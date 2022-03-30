import { defer, from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as Article from "./article";
import * as O from "fp-ts/lib/Option";
import { CreateArticle } from "./create-article";
import { PrismaClient } from "@prisma/client";
import { pipe } from "fp-ts/lib/function";

const prisma = new PrismaClient();

const castTo = <T>() => pipe(map(val => val as T));

const getAllArticles$ = (): Observable<Article.Type[]> => {
  return defer(() =>
    from(prisma.article.findMany()).pipe(castTo<Article.Type[]>())
  );
};

const findArticle$ = (slug: string): Observable<O.Option<Article.Type>> => {
  return from(
    prisma.article.findUnique({
      where: {
        slug,
      },
    })
  ).pipe(castTo<Article.Type>(), map(O.fromNullable));
};

const getArticle$ = (slug: string): Observable<O.Option<Article.Type>> =>
  defer(() => findArticle$(slug));

const createArticle$ = (article: CreateArticle): Observable<Article.Type> => {
  const {
    article: { title, description, body, tagList },
  } = article;

  return from(
    prisma.article.create({
      data: {
        title,
        description,
        body,
        tagList,
      },
    })
  ).pipe(castTo<Article.Type>());
};

export { getAllArticles$, getArticle$, createArticle$ };
