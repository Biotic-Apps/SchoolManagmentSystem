package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.ScheduleRow
import com.schoolapp.feature.timetable.TimetableUiState
import kotlinx.coroutines.flow.distinctUntilChanged

/** Day chips + swipeable day timelines, or (wide screens, "Week") the whole week as a grid. */
@Composable
internal fun WeekContent(
    state: TimetableUiState,
    wide: Boolean,
    weekLayout: Boolean,
    onWeekLayout: (Boolean) -> Unit,
    onDaySelected: (Int) -> Unit,
    onOpen: (ScheduleRow) -> Unit,
) {
    val days = state.days
    val showGrid = wide && weekLayout
    Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
        Column(Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (wide) LayoutSwitch(weekLayout, onWeekLayout)
            if (!showGrid) DaySelector(days, state.selectedDay, state.today, onDaySelected)
            WeekNotes(state)
        }
        if (showGrid) {
            WeekGrid(days, state.today, onOpen)
            return@Column
        }
        val selectedPage = days.indexOfFirst { it.day == state.selectedDay }.coerceAtLeast(0)
        val pager = rememberPagerState(initialPage = selectedPage) { days.size }
        LaunchedEffect(selectedPage) { if (pager.currentPage != selectedPage) pager.animateScrollToPage(selectedPage) }
        LaunchedEffect(pager, days) {
            snapshotFlow { pager.settledPage }.distinctUntilChanged().collect { page -> days.getOrNull(page)?.let { onDaySelected(it.day) } }
        }
        HorizontalPager(pager, Modifier.fillMaxSize(), key = { days[it].day }) { page ->
            val plan = days[page]
            DayTimeline(plan, isToday = plan.day == state.today, markerFor = state::markerFor, onOpen = onOpen)
        }
    }
}

/** State chip for editors, the class teacher's draft note, and a failed-refresh banner. */
@Composable
private fun WeekNotes(state: TimetableUiState) {
    state.stateChip?.let { TimetableStateChip(it, state.sectionVersion) }
    if (state.draftNote) InlineMessage(text = stringResource(R.string.timetable_draft_note), tone = StatusTone.Info)
    state.error?.let { InlineMessage(text = appErrorMessage(it), tone = StatusTone.Error) }
}

@Composable
private fun LayoutSwitch(weekLayout: Boolean, onWeekLayout: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
        SegmentedChoice(
            labels = listOf(stringResource(R.string.timetable_layout_day), stringResource(R.string.timetable_layout_week)),
            selectedIndex = if (weekLayout) 1 else 0,
            onSelect = { onWeekLayout(it == 1) },
            modifier = Modifier.widthIn(max = 240.dp),
        )
    }
}

/** Empty/status content that still scrolls so pull-to-refresh reaches it. */
@Composable
internal fun ScrollableState(content: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize().verticalScroll(rememberScrollState()), contentAlignment = Alignment.TopCenter) {
        Column(Modifier.padding(top = 32.dp)) {
            content()
            Text(
                stringResource(R.string.timetable_read_only),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                modifier = Modifier.padding(16.dp),
            )
        }
    }
}
