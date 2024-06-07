/*
  Warnings:

  - You are about to drop the column `groupId` on the `cardboards` table. All the data in the column will be lost.
  - You are about to drop the column `editionId` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `ordergroups` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `ordergroups` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `promoterId` on the `orders` table. All the data in the column will be lost.
  - Added the required column `groupid` to the `cardboards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `editionid` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupid` to the `ordergroups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderid` to the `ordergroups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerid` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promoterid` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cardboards" DROP COLUMN "groupId",
ADD COLUMN     "groupid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "editionId",
ADD COLUMN     "editionid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ordergroups" DROP COLUMN "groupId",
DROP COLUMN "orderId",
ADD COLUMN     "groupid" TEXT NOT NULL,
ADD COLUMN     "orderid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "customerId",
DROP COLUMN "promoterId",
ADD COLUMN     "customerid" TEXT NOT NULL,
ADD COLUMN     "promoterid" TEXT NOT NULL;
