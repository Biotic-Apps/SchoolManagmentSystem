-- Add WHATSAPP to notification_channel enum
ALTER TYPE "notification_channel" ADD VALUE IF NOT EXISTS 'WHATSAPP';

-- WhatsApp message audit log
CREATE TABLE "whatsapp_messages" (
    "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"     UUID         NOT NULL,
    "to"            TEXT         NOT NULL,
    "template_name" TEXT         NOT NULL,
    "status"        TEXT         NOT NULL DEFAULT 'PENDING',
    "error"         TEXT,
    "sent_at"       TIMESTAMPTZ(3),
    "created_at"    TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "whatsapp_messages_school_id_created_at_idx"
    ON "whatsapp_messages" ("school_id", "created_at");

CREATE INDEX "whatsapp_messages_status_created_at_idx"
    ON "whatsapp_messages" ("status", "created_at");

ALTER TABLE "whatsapp_messages"
    ADD CONSTRAINT "whatsapp_messages_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
