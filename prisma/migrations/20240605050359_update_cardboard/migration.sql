/*
  Warnings:

  - A unique constraint covering the columns `[cardno]` on the table `cardboards` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cardboards_cardno_key" ON "cardboards"("cardno");
