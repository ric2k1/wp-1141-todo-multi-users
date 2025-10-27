/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alias]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,oauthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alias` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oauthId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `provider` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."User_email_key";

-- DropIndex
DROP INDEX "public"."User_provider_providerId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "providerId",
ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "isAuthorized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "oauthId" TEXT NOT NULL,
ADD COLUMN     "oauthName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "provider" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_alias_key" ON "User"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_oauthId_key" ON "User"("provider", "oauthId");
