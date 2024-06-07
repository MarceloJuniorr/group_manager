/*
  Warnings:

  - You are about to drop the column `group_qtty` on the `orders` table. All the data in the column will be lost.
  - Added the required column `amount` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "group_qtty",
ADD COLUMN     "amount" INTEGER NOT NULL;
