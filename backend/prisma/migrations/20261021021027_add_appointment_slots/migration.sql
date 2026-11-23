-- CreateTable
CREATE TABLE "appointment_slots" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_slots_serviceId_idx" ON "appointment_slots"("serviceId");

-- CreateIndex
CREATE INDEX "appointment_slots_startAt_idx" ON "appointment_slots"("startAt");

-- CreateIndex
CREATE INDEX "appointment_slots_serviceId_startAt_idx" ON "appointment_slots"("serviceId", "startAt");

-- AddForeignKey
ALTER TABLE "appointment_slots" ADD CONSTRAINT "appointment_slots_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
