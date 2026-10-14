package com.schoolapp.feature.questionbank.generate

import com.schoolapp.core.model.questions.GeneratePaperInput
import com.schoolapp.core.model.questions.GenerateSection
import com.schoolapp.feature.questionbank.R

/** API limits: title ≤ 200, total 1–500, duration 10–300 minutes, section title ≤ 100, 1–50 questions, 1–100 marks each. */
internal object PaperValidation {
    private const val TITLE_MAX = 200
    private const val SECTION_TITLE_MAX = 100
    private val TOTAL = 1..500
    private val DURATION = 10..300
    private val COUNT = 1..50
    private val MARKS_EACH = 1..100

    fun check(state: GeneratePaperUiState): Map<String, Int> = buildMap {
        if (state.subjectId == null) put(SUBJECT, R.string.qb_error_subject)
        if (state.classId == null) put(CLASS, R.string.qb_error_class)
        when {
            state.title.isBlank() -> put(TITLE, R.string.qb_error_title)
            state.title.trim().length > TITLE_MAX -> put(TITLE, R.string.qb_error_too_long)
        }
        if (state.totalMarks.toIntOrNull() !in TOTAL) put(TOTAL_MARKS, R.string.qb_error_total_marks)
        if (state.duration.toIntOrNull() !in DURATION) put(DURATION_KEY, R.string.qb_error_duration)
        state.sections.forEachIndexed { i, s ->
            when {
                s.title.isBlank() -> put(sectionKey(i, "title"), R.string.qb_error_section_title)
                s.title.trim().length > SECTION_TITLE_MAX -> put(sectionKey(i, "title"), R.string.qb_error_too_long)
            }
            if (s.count.toIntOrNull() !in COUNT) put(sectionKey(i, "count"), R.string.qb_error_count)
            if (s.marksEach.toIntOrNull() !in MARKS_EACH) put(sectionKey(i, "marks"), R.string.qb_error_marks)
        }
    }

    /** Call only when [check] is empty. */
    fun toInput(state: GeneratePaperUiState, schoolId: String) = GeneratePaperInput(
        schoolId = schoolId,
        subjectId = requireNotNull(state.subjectId),
        classId = requireNotNull(state.classId),
        title = state.title.trim(),
        totalMarks = state.totalMarks.toInt(),
        durationMinutes = state.duration.toInt(),
        sections = state.sections.map { GenerateSection(it.title.trim(), it.count.toInt(), it.type, it.difficulty, it.marksEach.toInt()) },
    )

    fun sectionKey(index: Int, field: String) = "s$index.$field"

    const val SUBJECT = "subject"
    const val CLASS = "class"
    const val TITLE = "title"
    const val TOTAL_MARKS = "totalMarks"
    const val DURATION_KEY = "duration"
}
