package com.schoolapp.feature.exams.classresults

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.StudentResult

/** One class-section of the exam, e.g. "Class 5-A". */
@Immutable
data class ResultSection(val id: String, val label: String)

@Immutable
data class ClassResultsUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val exams: List<Exam> = emptyList(),
    val selectedExamId: String? = null,
    val sections: List<ResultSection> = emptyList(),
    val selectedSectionId: String? = null,
    /** Sections or results of the selection are loading. */
    val listLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val listError: AppError? = null,
    val results: List<StudentResult> = emptyList(),
    val openStudentId: String? = null,
) {
    val selectedExam: Exam?
        get() = exams.firstOrNull { it.id == selectedExamId }

    /** Computed but not approved yet (only approvers see these). */
    val notApproved: Boolean
        get() = selectedExam?.let { it.status < ExamStatus.RESULTS_APPROVED } == true

    val openResult: StudentResult?
        get() = openStudentId?.let { id -> results.firstOrNull { it.studentId == id } }
}

internal object ClassResultsRules {
    /** Web parity: everyone sees results once approved; approvers also once computed or marks are closed. */
    fun isVisible(exam: Exam, canApprove: Boolean): Boolean =
        exam.status >= ExamStatus.RESULTS_APPROVED ||
            (canApprove && (exam.computedAt != null || exam.status == ExamStatus.MARKS_CLOSED))

    /** Sections the user can see in the exam (the server scopes mark sheets like results). */
    fun sectionsOf(sheets: List<MarkSheet>): List<ResultSection> = sheets
        .distinctBy { it.sectionId }
        .map { ResultSection(it.sectionId, "${it.className}-${it.sectionName}") }
        .sortedBy { it.label }
}
