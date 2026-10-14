package com.schoolapp.feature.exams.manage.form

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.model.exams.grading.GradingScheme
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.SchoolClass

/** Field errors shown under the inputs once the user tries to save. */
@Immutable
data class ExamFormErrors(
    val name: Boolean = false,
    val session: Boolean = false,
    val scheme: Boolean = false,
    val weight: Boolean = false,
    val classes: Boolean = false,
) {
    val any: Boolean get() = name || session || scheme || weight || classes
}

@Immutable
data class ExamFormState(
    /** null = creating. */
    val examId: String? = null,
    val branchId: String? = null,
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val sessions: List<AcademicSession> = emptyList(),
    val terms: List<PersonRef> = emptyList(),
    val schemes: List<GradingScheme> = emptyList(),
    val schemesLoading: Boolean = false,
    val classes: List<SchoolClass> = emptyList(),
    val name: String = "",
    val type: ExamType = ExamType.TERM,
    val sessionId: String? = null,
    val termId: String? = null,
    val schemeId: String? = null,
    val weight: String = "",
    val classIds: Set<String> = emptySet(),
    val errors: ExamFormErrors = ExamFormErrors(),
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    /** One-shot: the saved exam, for the caller. */
    val saved: ExamDetail? = null,
) {
    val isEdit: Boolean get() = examId != null
}
