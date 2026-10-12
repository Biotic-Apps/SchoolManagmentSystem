-- Question Bank & Paper Generator

-- Enum: question_type
CREATE TYPE "question_type" AS ENUM ('MCQ', 'SHORT', 'LONG', 'TRUE_FALSE', 'FILL_BLANK');

-- Enum: difficulty_level
CREATE TYPE "difficulty_level" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- Enum: exam_paper_status
CREATE TYPE "exam_paper_status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "questions" (
    "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"        UUID         NOT NULL,
    "subject_id"       UUID         NOT NULL,
    "class_id"         UUID         NOT NULL,
    "chapter_name"     TEXT         NOT NULL,
    "question_type"    "question_type" NOT NULL,
    "difficulty_level" "difficulty_level" NOT NULL,
    "marks"            INTEGER      NOT NULL,
    "question_text"    TEXT         NOT NULL,
    "options"          JSONB,
    "correct_answer"   TEXT         NOT NULL,
    "status"           "record_status" NOT NULL DEFAULT 'ACTIVE'::"record_status",
    "created_by_id"    UUID         NOT NULL,
    "created_at"       TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_school_id_subject_id_class_id_status_idx"
    ON "questions"("school_id", "subject_id", "class_id", "status");

-- CreateIndex
CREATE INDEX "questions_school_id_question_type_difficulty_level_idx"
    ON "questions"("school_id", "question_type", "difficulty_level");

-- AddForeignKey
ALTER TABLE "questions"
    ADD CONSTRAINT "questions_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions"
    ADD CONSTRAINT "questions_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "subjects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions"
    ADD CONSTRAINT "questions_class_id_fkey"
    FOREIGN KEY ("class_id") REFERENCES "classes"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "generated_papers" (
    "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
    "school_id"     UUID         NOT NULL,
    "subject_id"    UUID         NOT NULL,
    "class_id"      UUID         NOT NULL,
    "title"         TEXT         NOT NULL,
    "total_marks"   INTEGER      NOT NULL,
    "duration"      INTEGER      NOT NULL,
    "sections"      JSONB        NOT NULL,
    "status"        "exam_paper_status" NOT NULL DEFAULT 'DRAFT'::"exam_paper_status",
    "created_by_id" UUID         NOT NULL,
    "created_at"    TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "generated_papers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generated_papers_school_id_subject_id_class_id_status_idx"
    ON "generated_papers"("school_id", "subject_id", "class_id", "status");

-- AddForeignKey
ALTER TABLE "generated_papers"
    ADD CONSTRAINT "generated_papers_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_papers"
    ADD CONSTRAINT "generated_papers_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "subjects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_papers"
    ADD CONSTRAINT "generated_papers_class_id_fkey"
    FOREIGN KEY ("class_id") REFERENCES "classes"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
