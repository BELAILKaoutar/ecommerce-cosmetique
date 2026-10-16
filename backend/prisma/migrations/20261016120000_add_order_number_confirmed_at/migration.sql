-- AlterTable
ALTER TABLE "orders" ADD COLUMN "orderNumber" VARCHAR(40);
ALTER TABLE "orders" ADD COLUMN "confirmedAt" TIMESTAMP(3);

UPDATE "orders"
SET "orderNumber" = 'CMD-' || to_char("createdAt", 'YYYYMMDD') || '-' || substr(replace("id"::text, '-', ''), 1, 6)
WHERE "orderNumber" IS NULL;

ALTER TABLE "orders" ALTER COLUMN "orderNumber" SET NOT NULL;

CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

ALTER TABLE "orders" ALTER COLUMN "customerName" TYPE VARCHAR(200);
ALTER TABLE "orders" ALTER COLUMN "city" TYPE VARCHAR(120);
