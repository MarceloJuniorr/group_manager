/*
  Warnings:

  - You are about to drop the column `group_id` on the `ordergroups` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `ordergroups` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `promoter_id` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `ordergroups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `ordergroups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promoterId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ordergroups" DROP COLUMN "group_id",
DROP COLUMN "order_id",
ADD COLUMN     "groupId" TEXT NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "customer_id",
DROP COLUMN "promoter_id",
ADD COLUMN     "customerId" TEXT NOT NULL,
ADD COLUMN     "promoterId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");
