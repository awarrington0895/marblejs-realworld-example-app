import { defer, Observable, throwError, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import * as Article from "./article";
import * as O from "fp-ts/lib/Option";
import { CreateArticle } from "./create-article";
import { PrismaClient, User } from "@prisma/client";
import slugify from "slugify";

const includeAuthor = {
  author: {
    select: {
      username: true,
    },
  },
};

const getAllArticles$ =
  (prisma: PrismaClient) => (): Observable<Article.Type[]> => {
    return defer(() =>
      prisma.article.findMany({
        include: includeAuthor,
      })
    ).pipe(map(models => models.map(Article.fromArticleModel)));
  };

const getArticle$ =
  (prisma: PrismaClient) =>
  (slug: string): Observable<O.Option<Article.Type>> =>
    defer(() =>
      prisma.article.findUnique({
        where: {
          slug,
        },
        include: includeAuthor,
      })
    ).pipe(map(Article.fromNullableArticleModel));

const createArticle$ =
  (prisma: PrismaClient) =>
  (article: CreateArticle, username: string): Observable<Article.Type> => {
    const {
      article: { title, description, body, tagList },
    } = article;

    const user$ = defer(() => prisma.user.findUnique({ where: { username } }));

    return user$.pipe(
      mergeMap((user: User | null) => {
        if (user === null) {
          return throwError(
            () => new Error(`User with username '${username} not found`)
          );
        }

        return of(user);
      }),
      mergeMap((user: User) => {
        const createdArticle = prisma.article.create({
          data: {
            title,
            slug: slugify(`${title}-${user?.id}`),
            description,
            body,
            tagList,
            author: {
              connect: {
                id: user?.id,
              },
            },
          },
          include: includeAuthor,
        });
        return createdArticle;
      }),
      map(Article.fromArticleModel)
    );
  };

export { getAllArticles$, getArticle$, createArticle$ };
