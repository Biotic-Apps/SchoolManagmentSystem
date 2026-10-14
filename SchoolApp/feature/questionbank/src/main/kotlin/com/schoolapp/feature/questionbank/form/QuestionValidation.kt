package com.schoolapp.feature.questionbank.form

import com.schoolapp.core.model.questions.QuestionInput
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.R

/** Same limits as the API: chapter ≤ 150, text ≤ 5000, answer ≤ 2000, marks 1–100, MCQ needs two choices. */
internal object QuestionValidation {
    private const val CHAPTER_MAX = 150
    private const val TEXT_MAX = 5000
    private const val ANSWER_MAX = 2000
    private const val MARKS_MAX = 100

    fun check(state: QuestionFormUiState): Map<QuestionField, Int> = buildMap {
        if (state.subjectId == null) put(QuestionField.SUBJECT, R.string.qb_error_subject)
        if (state.classId == null) put(QuestionField.CLASS, R.string.qb_error_class)
        when {
            state.chapter.isBlank() -> put(QuestionField.CHAPTER, R.string.qb_error_chapter)
            state.chapter.trim().length > CHAPTER_MAX -> put(QuestionField.CHAPTER, R.string.qb_error_too_long)
        }
        if (state.type == null) put(QuestionField.TYPE, R.string.qb_error_type)
        if (state.difficulty == null) put(QuestionField.DIFFICULTY, R.string.qb_error_difficulty)
        val marks = state.marks.trim().toIntOrNull()
        if (marks == null || marks !in 1..MARKS_MAX) put(QuestionField.MARKS, R.string.qb_error_marks)
        when {
            state.text.isBlank() -> put(QuestionField.TEXT, R.string.qb_error_text)
            state.text.trim().length > TEXT_MAX -> put(QuestionField.TEXT, R.string.qb_error_too_long)
        }
        if (state.type == QuestionType.MCQ) {
            val filled = state.options.count { it.isNotBlank() }
            when {
                filled < QuestionFormUiState.MIN_OPTIONS -> put(QuestionField.OPTIONS, R.string.qb_error_options)
                state.correctIndex == null || state.options.getOrNull(state.correctIndex).isNullOrBlank() ->
                    put(QuestionField.ANSWER, R.string.qb_error_pick_correct)
            }
        } else {
            when {
                state.answer.isBlank() -> put(QuestionField.ANSWER, R.string.qb_error_answer)
                state.answer.trim().length > ANSWER_MAX -> put(QuestionField.ANSWER, R.string.qb_error_too_long)
            }
        }
    }

    /** Call only when [check] is empty. */
    fun toInput(state: QuestionFormUiState, schoolId: String): QuestionInput {
        val type = requireNotNull(state.type)
        val mcq = type == QuestionType.MCQ
        val options = if (mcq) state.options.map { it.trim() }.filter { it.isNotEmpty() } else emptyList()
        val answer = if (mcq) state.options[requireNotNull(state.correctIndex)].trim() else state.answer.trim()
        return QuestionInput(
            schoolId = schoolId,
            subjectId = requireNotNull(state.subjectId),
            classId = requireNotNull(state.classId),
            chapterName = state.chapter.trim(),
            type = type,
            difficulty = requireNotNull(state.difficulty),
            marks = state.marks.trim().toInt(),
            text = state.text.trim(),
            options = options,
            correctAnswer = answer,
        )
    }

    /** API field path ("questionText must be …") to form field. */
    fun fieldOf(path: String): QuestionField? = when (path) {
        "subjectId" -> QuestionField.SUBJECT
        "classId" -> QuestionField.CLASS
        "chapterName" -> QuestionField.CHAPTER
        "questionType" -> QuestionField.TYPE
        "difficultyLevel" -> QuestionField.DIFFICULTY
        "marks" -> QuestionField.MARKS
        "questionText" -> QuestionField.TEXT
        "options" -> QuestionField.OPTIONS
        "correctAnswer" -> QuestionField.ANSWER
        else -> null
    }
}
