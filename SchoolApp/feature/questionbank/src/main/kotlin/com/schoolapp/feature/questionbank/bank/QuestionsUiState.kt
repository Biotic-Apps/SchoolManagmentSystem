package com.schoolapp.feature.questionbank.bank

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.Question
import com.schoolapp.core.model.questions.QuestionFilter
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.common.Catalog
import com.schoolapp.feature.questionbank.common.QuestionPermissions
import com.schoolapp.feature.questionbank.common.SchoolOption

@Immutable
data class QuestionsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val schools: List<SchoolOption> = emptyList(),
    val schoolId: String? = null,
    val catalog: Catalog = Catalog(),
    val subjectId: String? = null,
    val classId: String? = null,
    val type: QuestionType? = null,
    val difficulty: Difficulty? = null,
    val search: String = "",
    val questions: List<Question> = emptyList(),
    val page: Int = 1,
    val canLoadMore: Boolean = false,
    val isLoadingMore: Boolean = false,
    val permissions: QuestionPermissions = QuestionPermissions(),
    val selected: Question? = null,
    val confirmArchive: Question? = null,
    val archivingId: String? = null,
    val actionError: AppError? = null,
) {
    val noSchool: Boolean get() = !isLoading && error == null && schoolId == null

    val hasFilters: Boolean
        get() = subjectId != null || classId != null || type != null || difficulty != null || search.isNotBlank()

    fun filter() = QuestionFilter(schoolId, subjectId, classId, type, difficulty, search)
}
