package com.schoolapp.core.model.questions

/** Question kinds of the bank; [key] is the API value. */
enum class QuestionType(val key: String) {
    MCQ("MCQ"),
    SHORT("SHORT"),
    LONG("LONG"),
    TRUE_FALSE("TRUE_FALSE"),
    FILL_BLANK("FILL_BLANK"),
    ;

    companion object {
        fun from(key: String?): QuestionType? = entries.firstOrNull { it.key.equals(key, ignoreCase = true) }
    }
}

enum class Difficulty(val key: String) {
    EASY("EASY"),
    MEDIUM("MEDIUM"),
    HARD("HARD"),
    ;

    companion object {
        fun from(key: String?): Difficulty? = entries.firstOrNull { it.key.equals(key, ignoreCase = true) }
    }
}

enum class PaperStatus(val key: String) {
    DRAFT("DRAFT"),
    PUBLISHED("PUBLISHED"),
    ;

    companion object {
        fun from(key: String?): PaperStatus = entries.firstOrNull { it.key.equals(key, ignoreCase = true) } ?: DRAFT
    }
}
