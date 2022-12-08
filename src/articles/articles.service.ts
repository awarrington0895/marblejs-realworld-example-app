import { PrismaClient, User } from "@prisma/client";
import { Observable, defer, throwError, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { ArticleQueryParams } from "./article-query-params";
import * as Article from "./article";
import * as O from "fp-ts/Option";
import { UpdateArticle } from "./update-article";
import slugify from "slugify";
import { HttpError, HttpStatus } from "@marblejs/http";
import { CreateArticle } from "./create-article";
import { createContextToken, createReader, useContext } from "@marblejs/core";
import { PrismaConnectionToken } from "@conduit/db";
import * as F from "fp-ts/function";

type UpdateArticleParams = {
  slug: string;
  username: string;
  updateArticle: UpdateArticle;
};

const includeAuthor = {
  author: {
    select: {
      username: true,
    },
  },
};

const buildAllQuery = (query: ArticleQueryParams) => {
  const queries = [];

  if ("tag" in query) {
    queries.push({
      tagList: {
        has: query.tag,
      },
    });
  }

  if ("author" in query) {
    queries.push({
      author: {
        username: query.author,
      },
    });
  }

  return queries;
};

const createArticleService = (prisma: PrismaClient) => {
  return {
    getAllArticles$(query?: ArticleQueryParams): Observable<Article.Type[]> {
      return defer(() => {
        if (query !== undefined && Object.keys(query).length) {
          return prisma.article.findMany({
            where: { AND: buildAllQuery(query) },
            include: includeAuthor,
          });
        }

        return prisma.article.findMany({
          include: includeAuthor,
        });
      }).pipe(map(models => models.map(Article.fromArticleModel)));
    },

    getArticle$(slug: string): Observable<O.Option<Article.Type>> {
      return defer(() =>
        prisma.article.findUnique({
          where: {
            slug,
          },
          include: includeAuthor,
        })
      ).pipe(map(Article.fromNullableArticleModel));
    },

    updateArticle$(params: UpdateArticleParams) {
      const { username, slug, updateArticle } = params;

      return defer(() => prisma.user.findUnique({ where: { username } })).pipe(
        mergeMap((user: User | null) => {
          if (user === null) {
            return throwError(
              () =>
                new HttpError(
                  `User with username '${username} not found`,
                  HttpStatus.INTERNAL_SERVER_ERROR,
                  { username }
                )
            );
          }

          const update = F.pipe(
            O.fromNullable(updateArticle.article.title),
            O.map(title => ({
              ...updateArticle.article,
              slug: slugify(`${title}-${user?.id}`),
            })),
            O.getOrElse(() => updateArticle.article)
          );

          return prisma.article.update({
            data: update,
            where: {
              slug,
            },
            include: includeAuthor,
          });
        }),
        map(Article.fromArticleModel)
      );
    },

    createArticle$(
      article: CreateArticle,
      username: string
    ): Observable<Article.Type> {
      const {
        article: { title, description, body, tagList },
      } = article;

      const user$ = defer(() =>
        prisma.user.findUnique({ where: { username } })
      );

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
    },

    deleteArticle$: (slug: string) =>
      defer(() => prisma.article.delete({ where: { slug } })),
  };
};

const ArticleServiceToken =
  createContextToken<ReturnType<typeof createArticleService>>("ArticleService");

const ArticleServiceReader = createReader(ask => {
  const prismaClient = useContext(PrismaConnectionToken)(ask);

  return createArticleService(prismaClient);
});

export { ArticleServiceToken, ArticleServiceReader };
