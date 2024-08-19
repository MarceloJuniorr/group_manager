/*
 Warnings:
 
 - Added the required column `cardboard_limit` to the `editions` table without a default value. This is not possible if the table is not empty.
 - Added the required column `group_limit` to the `editions` table without a default value. This is not possible if the table is not empty.
 
 */
-- AlterTable
ALTER TABLE
  "editions"
ADD
  COLUMN "cardboard_limit" INTEGER NOT NULL DEFAULT 0,
ADD
  COLUMN "group_limit" INTEGER NOT NULL DEFAULT 0,
ADD
  COLUMN "sorteio" TEXT NOT NULL DEFAULT '';