import { PrismaClient, User } from "@prisma/client";
import { Observable, defer } from "rxjs";
import { CreateUser } from "./create-user";

const createUser$ =
  (prisma: PrismaClient) =>
  (user: CreateUser): Observable<User> => {
    const {
      user: { username, email, password },
    } = user;

    return defer(() =>
      prisma.user.create({
        data: {
          username,
          email,
          password,
        },
      })
    );
  };

export { createUser$ };
