package com.schoolapp.feature.questionbank.generate

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.common.Catalog

/** One section row of the generator; numbers are kept as typed text until validated. */
@Immutable
data class SectionDraft(
    val key: Long,
    val title: String,
    val type: QuestionType,
    val difficulty: Difficulty,
    val count: String,
    val marksEach: String,
) {
    val marks: Int get() = (count.toIntOrNull() ?: 0) * (marksEach.toIntOrNull() ?: 0)
}

@Immutable
data class GeneratePaperUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val catalog: Catalog = Catalog(),
    val subjectId: String? = null,
    val classId: String? = null,
    val title: String = "",
    val totalMarks: String = "",
    val duration: String = "",
    val sections: List<SectionDraft> = listOf(SectionDraft(0, "Section A", QuestionType.MCQ, Difficulty.EASY, "5", "1")),
    /** Field key ("title", "s0.count", …) to string resource. */
    val errors: Map<String, Int> = emptyMap(),
    val generateError: AppError? = null,
    val isGenerating: Boolean = false,
    val generatedPaperId: String? = null,
) {
    val sectionMarks: Int get() = sections.sumOf { it.marks }

    /** Sections add up to a different total than the one typed (a hint, not an error — as on the web). */
    val marksMismatch: Boolean get() = totalMarks.toIntOrNull()?.let { it != sectionMarks } ?: false
}
