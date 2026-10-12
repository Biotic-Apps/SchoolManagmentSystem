-- Report card templates: customisable layout / content settings per school or branch.

CREATE TABLE "report_card_templates" (
    "id"                 UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"          UUID         NOT NULL,
    "branch_id"          UUID,
    "name"               TEXT         NOT NULL,
    "is_default"         BOOLEAN      NOT NULL DEFAULT false,
    "layout"             JSONB        NOT NULL DEFAULT '{"orientation":"portrait","paperSize":"A4"}',
    "header"             JSONB        NOT NULL DEFAULT '{"showLogo":true}',
    "show_grading_scale" BOOLEAN      NOT NULL DEFAULT true,
    "show_skills"        BOOLEAN      NOT NULL DEFAULT true,
    "show_remarks"       BOOLEAN      NOT NULL DEFAULT true,
    "show_attendance"    BOOLEAN      NOT NULL DEFAULT false,
    "show_position"      BOOLEAN      NOT NULL DEFAULT true,
    "signatures"         JSONB        NOT NULL DEFAULT '["Class teacher","Principal","Parent / guardian"]',
    "remark_labels"      JSONB,
    "footer_text"        TEXT,
    "created_by_id"      UUID         NOT NULL,
    "created_at"         TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
    "updated_at"         TIMESTAMPTZ(3) NOT NULL DEFAULT now(),

    CONSTRAINT "report_card_templates_pkey" PRIMARY KEY ("id")
);

-- Each branch can have at most one template with a given name.
CREATE UNIQUE INDEX "report_card_templates_branch_id_name_key"
    ON "report_card_templates" ("branch_id", "name");

CREATE INDEX "report_card_templates_school_id_idx"
    ON "report_card_templates" ("school_id");

-- Add template reference to report_cards.
ALTER TABLE "report_cards"
    ADD COLUMN "template_id" UUID;

ALTER TABLE "report_cards"
    ADD CONSTRAINT "report_cards_template_id_fkey"
    FOREIGN KEY ("template_id") REFERENCES "report_card_templates" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
