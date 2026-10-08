package com.schoolapp.feature.timetable.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BeachAccess
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
import com.schoolapp.feature.timetable.DayPlan
import com.schoolapp.feature.timetable.DayStatus
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.TimetableMode
import com.schoolapp.feature.timetable.TimetableStatus
import com.schoolapp.feature.timetable.TimetableUiState

/** Whole-screen states: not published, not assigned, nothing built yet, no sections. */
@Composable
internal fun TimetableStatusState(state: TimetableUiState, modifier: Modifier = Modifier) {
    when (state.status) {
        TimetableStatus.NOT_ASSIGNED -> EmptyState(
            stringResource(R.string.timetable_not_assigned),
            modifier,
            message = stringResource(R.string.timetable_not_assigned_message),
            icon = Icons.Outlined.PersonSearch,
        )
        TimetableStatus.NOT_CREATED -> EmptyState(
            stringResource(R.string.timetable_not_created),
            modifier,
            message = stringResource(R.string.timetable_not_created_message),
            icon = Icons.Outlined.EventBusy,
        )
        TimetableStatus.NO_SECTIONS -> EmptyState(
            stringResource(if (state.mode == TimetableMode.SECTION) R.string.timetable_no_sections else R.string.timetable_no_my_sections),
            modifier,
            icon = Icons.Outlined.Schedule,
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
