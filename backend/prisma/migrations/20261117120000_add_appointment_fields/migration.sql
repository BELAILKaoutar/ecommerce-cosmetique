ALTER TABLE "appointments" ADD COLUMN "serviceType" VARCHAR(10) NOT NULL DEFAULT 'CENTRE';
ALTER TABLE "appointments" ADD COLUMN "address" TEXT;
ALTER TABLE "appointments" ADD COLUMN "notes" TEXT;
ALTER TABLE "appointments" ADD COLUMN "expiresAt" TIMESTAMP(3);
