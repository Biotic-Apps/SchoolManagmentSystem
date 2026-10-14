package com.schoolapp.feature.timetable.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BeachAccess
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.PersonSearch
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.Weekend
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.feature.timetable.DayPlan
import com.schoolapp.feature.timetable.DayStatus
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.TimetableMode
import com.schoolapp.feature.timetable.TimetableStatus
import com.schoolapp.feature.timetable.TimetableUiState

/** Whole-screen states: not published, not assigned, nothing built yet, no sections, teacher week. */
@Composable
internal fun TimetableStatusState(
    state: TimetableUiState,
    modifier: Modifier = Modifier,
    onEditSection: ((sectionId: String, title: String) -> Unit)? = null,
) {
    when (state.status) {
        TimetableStatus.NOT_ASSIGNED -> EmptyState(
            stringResource(R.string.timetable_not_assigned),
            modifier,
            message = stringResource(R.string.timetable_not_assigned_message),
            icon = Icons.Outlined.PersonSearch,
        )
        TimetableStatus.NOT_CREATED -> NotCreatedState(state, modifier, onEditSection)
        TimetableStatus.NO_SECTIONS -> EmptyState(
            stringResource(if (state.mode == TimetableMode.SECTION) R.string.timetable_no_sections else R.string.timetable_no_my_sections),
            modifier,
            icon = Icons.Outlined.Schedule,
        )
        TimetableStatus.CHOOSE_TEACHER -> EmptyState(
            stringResource(R.string.tt_choose_teacher),
            modifier,
            message = stringResource(R.string.tt_choose_teacher_hint),
            icon = Icons.Outlined.PersonSearch,
        )
        TimetableStatus.TEACHER_FREE -> EmptyState(
            stringResource(R.string.tt_teacher_free_title),
            modifier,
            message = stringResource(R.string.tt_teacher_free_message),
            icon = Icons.Outlined.EventAvailable,
        )
        else -> EmptyState(
            stringResource(R.string.timetable_not_published),
            modifier,
            message = stringResource(
                when {
                    state.showsSections -> R.string.timetable_not_published_section
                    state.mode == TimetableMode.CHILD -> R.string.timetable_not_published_child
                    else -> R.string.timetable_not_published_week
                },
            ),
            icon = Icons.Outlined.EventBusy,
        )
    }
}

/** No timetable yet: whoever may build it gets a "Build timetable" button straight into the builder. */
@Composable
private fun NotCreatedState(state: TimetableUiState, modifier: Modifier, onEditSection: ((String, String) -> Unit)?) {
    val sectionId = state.selectedSectionId?.takeIf { state.sectionEditable && onEditSection != null }
    EmptyState(
        stringResource(R.string.timetable_not_created),
        modifier,
        message = stringResource(if (sectionId != null) R.string.timetable_not_created_message else R.string.timetable_not_created_viewer),
        icon = Icons.Outlined.EventBusy,
        action = sectionId?.let { id ->
            @Composable {
                val title = state.sections.firstOrNull { it.id == id }?.label.orEmpty()
                PrimaryButton(stringResource(R.string.tt_build_timetable), onClick = { onEditSection?.invoke(id, title) }, leadingIcon = Icons.Outlined.Edit)
            }
        },
    )
}

/** A selected day without lessons: holiday, a non-working day, or simply free. */
@Composable
internal fun DayEmptyState(plan: DayPlan, isToday: Boolean, modifier: Modifier = Modifier) {
    val dayName = stringArrayResource(R.array.timetable_days_long).getOrElse(plan.day - 1) { "" }
    when (plan.status) {
        DayStatus.HOLIDAY -> EmptyState(stringResource(R.string.timetable_holiday), modifier, message = plan.holiday, icon = Icons.Outlined.BeachAccess)
        DayStatus.NO_SCHOOL -> EmptyState(
            stringResource(R.string.timetable_no_school, dayName),
            modifier,
            message = stringResource(R.string.timetable_no_school_message),
            icon = Icons.Outlined.Weekend,
        )
        else -> EmptyState(
            if (isToday) stringResource(R.string.timetable_free_day_today) else stringResource(R.string.timetable_free_day, dayName),
            modifier,
            message = stringResource(R.string.timetable_free_day_message),
            icon = Icons.Outlined.EventAvailable,
        )
    }
}
