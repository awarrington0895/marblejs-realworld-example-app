import { defer, Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as Article from "./article";
import * as O from "fp-ts/lib/Option";
import { CreateArticle } from "./create-article";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const getAllArticles$ =
  (prisma: PrismaClient) => (): Observable<Article.Type[]> => {
    return defer(() => prisma.article.findMany()).pipe(
      map(models => models.map(Article.fromArticleModel))
    );
  };

const getArticle$ =
  (prisma: PrismaClient) =>
  (slug: string): Observable<O.Option<Article.Type>> =>
    defer(() =>
      prisma.article.findUnique({
        where: {
          slug,
        },
      })
    ).pipe(map(Article.fromNullableArticleModel));

const createArticle$ =
  (prisma: PrismaClient) =>
  (article: CreateArticle): Observable<Article.Type> => {
    const {
      article: { title, description, body, tagList },
    } = article;

    return defer(() =>
      prisma.article.create({
        data: {
          title,
          slug: slugify(title),
          description,
          body,
          tagList,
          author: {
            connect: {
              id: 1,
            },
          },
        },
      })
    ).pipe(map(Article.fromArticleModel));
  };

export { getAllArticles$, getArticle$, createArticle$ };
