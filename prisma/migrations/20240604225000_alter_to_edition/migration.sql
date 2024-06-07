/*
  Warnings:

  - You are about to drop the column `active` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `edicao` on the `groups` table. All the data in the column will be lost.
  - Added the required column `editionId` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "active",
DROP COLUMN "edicao",
ADD COLUMN     "editionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "editions" (
    "id" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "editions_pkey" PRIMARY KEY ("id")
);
