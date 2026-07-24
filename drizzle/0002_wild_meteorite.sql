ALTER TABLE "bookings" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_idempotency_key_unique" UNIQUE("idempotency_key");