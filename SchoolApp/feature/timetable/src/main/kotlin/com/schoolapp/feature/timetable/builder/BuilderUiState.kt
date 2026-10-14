package com.schoolapp.feature.timetable.builder

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.designsystem.component.SaveStatus
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.core.model.timetable.TimetableBuilder
import com.schoolapp.core.model.timetable.TimetableState

/** A section the user may open in the builder ("Class 9 · A (Science)") with its timetable state. */
@Immutable
data class SectionChoice(val id: String, val label: String, val state: TimetableState?)

/**
 * Timetable builder for one section: day chips, the day's periods, a lesson sheet that autosaves each lesson,
 * publish (only with `timetable.publish`; disabled with the server's reason) and discard.
 */
@Immutable
data class BuilderUiState(
    val isLoading: Boolean = true,
    /** Pull-to-refresh of the open section (the grid stays visible). */
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val choices: List<SectionChoice> = emptyList(),
    val sectionId: String? = null,
    val builder: TimetableBuilder? = null,
    val staff: List<TeachingStaff> = emptyList(),
    val selectedDay: Int = 1,
    val saveStatus: SaveStatus = SaveStatus.IDLE,
    val mayPublish: Boolean = false,
    val editor: LessonEditor? = null,
    val showLessons: Boolean = false,
    val publishing: Boolean = false,
    val confirmDiscard: Boolean = false,
    val discarding: Boolean = false,
    val actionError: ActionError? = null,
    /** One-shot confirmation after publish / discard. */
    val notice: BuilderNotice? = null,
) {
    val canEdit: Boolean get() = builder?.draft?.canEdit == true
    val days: List<Int> get() = builder?.draft?.workingDays?.ifEmpty { DEFAULT_DAYS } ?: DEFAULT_DAYS
    val showDiscard: Boolean get() = mayPublish && builder?.draft?.state == TimetableState.PUBLISHED_WITH_CHANGES

    /** Why Publish is off; null when it can go. */
    val publishBlockedReason: String?
        get() {
            val draft = builder?.draft ?: return null
            return if (draft.canPublish) null else draft.publishBlockedReason
        }

    companion object {
        val DEFAULT_DAYS = listOf(1, 2, 3, 4, 5, 6)
    }
}

enum class BuilderNotice { PUBLISHED, DISCARDED }

/** The lesson sheet for one period; [allocate] = also make the teacher this subject's teacher here. */
@Immutable
data class LessonEditor(
    val day: Int,
    val periodIndex: Int,
    val subjectId: String? = null,
    val staffId: String? = null,
    val roomId: String? = null,
    val allocate: Boolean = true,
    val existing: Boolean = false,
    val showErrors: Boolean = false,
)
