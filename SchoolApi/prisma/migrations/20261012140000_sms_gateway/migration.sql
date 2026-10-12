-- SMS Gateway: outbox table for the android-relay SMS driver.

CREATE TYPE "sms_outbox_status" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "sms_outbox" (
    "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "school_id"  UUID NOT NULL,
    "to"         TEXT NOT NULL,
    "message"    TEXT NOT NULL,
    "sender_id"  TEXT,
    "status"     "sms_outbox_status" NOT NULL DEFAULT 'PENDING',
    "attempts"   INTEGER NOT NULL DEFAULT 0,
    "error"      TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at"    TIMESTAMPTZ(3),

    CONSTRAINT "sms_outbox_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sms_outbox_school_id_status_created_at_idx"
    ON "sms_outbox" ("school_id", "status", "created_at");

ALTER TABLE "sms_outbox"
    ADD CONSTRAINT "sms_outbox_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
