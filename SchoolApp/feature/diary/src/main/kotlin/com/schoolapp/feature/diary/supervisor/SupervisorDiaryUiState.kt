package com.schoolapp.feature.diary.supervisor

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.diary.DiaryEntry

@Immutable
data class MissingGroup(val sectionId: String, val title: String, val subjects: List<String>)

/** Open "return to teacher" sheet for a SUBMITTED entry. */
@Immutable
data class ReturnEditor(
    val entryId: String,
    val subjectName: String?,
    val comment: String = "",
    val commentMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class SupervisorDiaryUiState(
    val date: String = "",
    val today: String = "",
    val missingLoading: Boolean = true,
    val missingError: AppError? = null,
    val missing: List<MissingGroup> = emptyList(),
    val sections: List<SwitcherOption> = emptyList(),
    val sectionsError: AppError? = null,
    val selectedSectionId: String? = null,
    val entriesLoading: Boolean = false,
    val entriesError: AppError? = null,
    val entries: List<DiaryEntry> = emptyList(),
    val canReturn: Boolean = false,
    val returnEditor: ReturnEditor? = null,
    val returnedMessage: Boolean = false,
    val publishingId: String? = null,
    val publishedMessage: Boolean = false,
    val publishError: AppError? = null,
) {
    val selectedSectionLabel: String? get() = sections.firstOrNull { it.id == selectedSectionId }?.label
}
