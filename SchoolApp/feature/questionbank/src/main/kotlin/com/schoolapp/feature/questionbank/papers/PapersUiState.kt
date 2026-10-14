package com.schoolapp.feature.questionbank.papers

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.questions.ExamPaper
import com.schoolapp.feature.questionbank.common.Catalog
import com.schoolapp.feature.questionbank.common.QuestionPermissions
import com.schoolapp.feature.questionbank.common.SchoolOption

@Immutable
data class PapersUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val schools: List<SchoolOption> = emptyList(),
    val schoolId: String? = null,
    val catalog: Catalog = Catalog(),
    val subjectId: String? = null,
    val classId: String? = null,
    val papers: List<ExamPaper> = emptyList(),
    val permissions: QuestionPermissions = QuestionPermissions(),
) {
    val noSchool: Boolean get() = !isLoading && error == null && schoolId == null
    val hasFilters: Boolean get() = subjectId != null || classId != null
}
