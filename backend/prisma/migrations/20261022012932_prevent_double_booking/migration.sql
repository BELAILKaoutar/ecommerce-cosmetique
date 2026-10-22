-- This is an empty migration.
CREATE UNIQUE INDEX "appointments_one_active_booking_per_slot"
ON "appointments" ("slotId")
WHERE "status" IN ('PENDING', 'CONFIRMED');
