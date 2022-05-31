-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "image" TEXT DEFAULT E'https://api.realworld.io/images/smiley-cyrus.jpeg';
