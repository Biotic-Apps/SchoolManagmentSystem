-- CreateEnum
CREATE TYPE "skill_domain" AS ENUM ('AFFECTIVE', 'PSYCHOMOTOR');


-- CreateTable
CREATE TABLE "skill_items" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "domain" "skill_domain" NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "skill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_scale_levels" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "value" INTEGER NOT NULL,
    "code" VARCHAR(4) NOT NULL,
    "label" VARCHAR(40) NOT NULL,

    CONSTRAINT "skill_scale_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_ratings" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "value" INTEGER NOT NULL,
    "updated_by_id" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "skill_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "skill_items_branch_id_active_idx" ON "skill_items"("branch_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "skill_items_branch_id_domain_name_key" ON "skill_items"("branch_id", "domain", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_scale_levels_branch_id_value_key" ON "skill_scale_levels"("branch_id", "value");

-- CreateIndex
CREATE INDEX "skill_ratings_exam_id_section_id_idx" ON "skill_ratings"("exam_id", "section_id");

-- CreateIndex
CREATE INDEX "skill_ratings_student_id_idx" ON "skill_ratings"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_ratings_exam_id_student_id_item_id_key" ON "skill_ratings"("exam_id", "student_id", "item_id");

-- AddForeignKey
ALTER TABLE "skill_ratings" ADD CONSTRAINT "skill_ratings_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_ratings" ADD CONSTRAINT "skill_ratings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "skill_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Default behaviour & skills for every existing branch (new branches get the
-- same defaults on first use, see results/skills/skill-defaults.ts).
INSERT INTO "skill_items" ("id", "school_id", "branch_id", "domain", "name", "sort_order", "updated_at")
SELECT gen_random_uuid(), b."school_id", b."id", d.domain::"skill_domain", d.name, d.sort_order, now()
FROM "branches" b
CROSS JOIN (VALUES
  ('AFFECTIVE', 'Punctuality', 1),
  ('AFFECTIVE', 'Neatness', 2),
  ('AFFECTIVE', 'Behaviour', 3),
  ('AFFECTIVE', 'Attentiveness', 4),
  ('AFFECTIVE', 'Politeness', 5),
  ('AFFECTIVE', 'Cooperation with others', 6),
  ('AFFECTIVE', 'Honesty', 7),
  ('AFFECTIVE', 'Self-control', 8),
  ('PSYCHOMOTOR', 'Handwriting', 1),
  ('PSYCHOMOTOR', 'Sports & games', 2),
  ('PSYCHOMOTOR', 'Drawing & painting', 3),
  ('PSYCHOMOTOR', 'Crafts', 4),
  ('PSYCHOMOTOR', 'Verbal fluency', 5),
  ('PSYCHOMOTOR', 'Musical skills', 6)
) AS d(domain, name, sort_order)
ON CONFLICT ("branch_id", "domain", "name") DO NOTHING;

INSERT INTO "skill_scale_levels" ("id", "school_id", "branch_id", "value", "code", "label")
SELECT gen_random_uuid(), b."school_id", b."id", l.value, l.code, l.label
FROM "branches" b
CROSS JOIN (VALUES
  (5, 'A', 'Excellent'),
  (4, 'B', 'Very good'),
  (3, 'C', 'Good'),
  (2, 'D', 'Fair'),
  (1, 'E', 'Needs improvement')
) AS l(value, code, label)
ON CONFLICT ("branch_id", "value") DO NOTHING;
