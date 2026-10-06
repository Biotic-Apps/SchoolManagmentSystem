package com.schoolapp.feature.progress.homework

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.progress.HomeworkStatus

@Immutable
data class HomeworkUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val sections: List<Section> = emptyList(),
    val selectedSectionId: String? = null,
    val today: String = "",
    val date: String = "",
    val isLoadingEntries: Boolean = false,
    val entriesError: AppError? = null,
    val entries: List<DiaryEntry> = emptyList(),
    val selectedEntry: DiaryEntry? = null,
    val isLoadingRoster: Boolean = false,
    val rosterError: AppError? = null,
    val roster: List<StudentSummary> = emptyList(),
    val ticks: Map<String, HomeworkStatus> = emptyMap(),
    val isSaving: Boolean = false,
    val message: HomeworkMessage? = null,
) {
    val tickedCount: Int get() = ticks.size
}

sealed interface HomeworkMessage {
    data object Saved : HomeworkMessage
    data object NeedTick : HomeworkMessage
    data class Failed(val error: AppError) : HomeworkMessage
}
