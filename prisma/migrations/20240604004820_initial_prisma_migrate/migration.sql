-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "seqno" INTEGER NOT NULL,
    "edicao" TEXT NOT NULL,
    "pdf" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cardboards" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "cardno" TEXT NOT NULL,
    "picture" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "cardboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promoters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "promoters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "promoter_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "group_qtty" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordergroups" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "ordergroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "rules" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "pass" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
