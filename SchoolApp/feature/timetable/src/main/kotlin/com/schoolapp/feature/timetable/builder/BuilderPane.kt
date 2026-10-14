package com.schoolapp.feature.timetable.builder

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ListAlt
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Publish
import androidx.compose.material.icons.automirrored.outlined.Undo
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.CollapsingHeaderLayout
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.SaveIndicator
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.components.TimetableStateChip
import kotlinx.coroutines.flow.distinctUntilChanged

/** Section picker, toolbar (state, save indicator, Publish / Discard, Lessons) and the swipeable day list. */
@Composable
internal fun BuilderPane(state: BuilderUiState, viewModel: TimetableBuilderViewModel, showPicker: Boolean, modifier: Modifier = Modifier) {
    val picker: @Composable () -> Unit = {
        if (showPicker && state.choices.isNotEmpty()) {
            CreatablePickerField(
                label = stringResource(R.string.tt_section),
                options = state.choices.map { PickerOption(it.id, it.label, it.state?.let { s -> stateText(s) }) },
                selectedId = state.sectionId,
                onSelect = { it?.let(viewModel::selectSection) },
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }
    }
    val builder = state.builder
    if (builder != null && !state.isLoading) {
        // Picker, toolbar and day chips scroll away with the day's periods so the page reads as one scroll.
        RefreshBox(state.isRefreshing, viewModel::refresh, modifier.fillMaxSize()) {
            CollapsingHeaderLayout(
                header = {
                    Column {
                        picker()
                        Toolbar(state, viewModel)
                        DayChips(state, viewModel)
                    }
                },
                modifier = Modifier.fillMaxSize(),
            ) { DayPager(state, viewModel) }
        }
    } else {
        Column(modifier.fillMaxSize()) {
            picker()
            when {
                state.isLoading -> LoadingState()
                state.choices.isEmpty() && state.error == null ->
                    EmptyState(stringResource(R.string.tt_no_sections_title), message = stringResource(R.string.tt_no_sections_hint))
                else -> ErrorState(appErrorMessage(state.error ?: AppError.Unknown()), onRetry = viewModel::retry)
            }
        }
    }
    LessonEditorSheet(state, viewModel)
    if (state.showLessons) LessonsSummarySheet(state, onDismiss = { viewModel.showLessons(false) })
    if (state.confirmDiscard) {
        ConfirmDialog(
            title = stringResource(R.string.tt_discard_title),
            message = stringResource(R.string.tt_discard_message),
            confirmLabel = stringResource(R.string.tt_discard),
            onConfirm = viewModel::discard,
            onDismiss = { viewModel.askDiscard(false) },
            destructive = true,
        )
    }
}

@Composable
private fun Toolbar(state: BuilderUiState, viewModel: TimetableBuilderViewModel) {
    val draft = state.builder?.draft ?: return
    Column(Modifier.padding(horizontal = 16.dp, vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            TimetableStateChip(draft.state, draft.version)
            SaveIndicator(state.saveStatus, Modifier.weight(1f))
            AppTextButton(stringResource(R.string.tt_lessons), onClick = { viewModel.showLessons(true) }, leadingIcon = Icons.AutoMirrored.Outlined.ListAlt)
        }
        if (!state.canEdit) {
            Text(stringResource(R.string.tt_view_only), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        if (state.mayPublish) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                PrimaryButton(
                    stringResource(R.string.tt_publish),
                    onClick = viewModel::publish,
                    enabled = draft.canPublish && state.saveStatus != com.schoolapp.core.designsystem.component.SaveStatus.SAVING,
                    loading = state.publishing,
                    leadingIcon = Icons.Outlined.Publish,
                )
                if (state.showDiscard) {
                    AppTextButton(
                        stringResource(R.string.tt_discard),
                        onClick = { viewModel.askDiscard(true) },
                        loading = state.discarding,
                        leadingIcon = Icons.AutoMirrored.Outlined.Undo,
                    )
                }
            }
        }
        state.publishBlockedReason?.takeIf { state.canEdit }?.let {
            Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        state.notice?.let {
            val text = stringResource(if (it == BuilderNotice.PUBLISHED) R.string.tt_published_notice else R.string.tt_discarded_notice)
            Notice(text, StatusTone.Success, viewModel::noticeShown)
        }
        state.actionError?.let { Notice(actionErrorMessage(it.error, it.details), StatusTone.Error, viewModel::dismissError) }
    }
}

@Composable
private fun Notice(text: String, tone: StatusTone, onDismiss: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        InlineMessage(text, tone, Modifier.weight(1f))
        IconButton(onClick = onDismiss) { Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.tt_dismiss)) }
    }
}

@Composable
private fun DayChips(state: BuilderUiState, viewModel: TimetableBuilderViewModel) {
    FilterChipRow(
        options = state.days.map { SwitcherOption(it.toString(), stringResource(dayNameRes(it))) },
        selectedId = state.selectedDay.toString(),
        onSelect = { viewModel.selectDay(it.toInt()) },
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
    )
}

/** Swipeable days in step with the chips: chip taps scroll the pager, a settled swipe selects the day. */
@Composable
private fun DayPager(state: BuilderUiState, viewModel: TimetableBuilderViewModel) {
    val builder = state.builder ?: return
    val days = state.days
    val pager = rememberPagerState(initialPage = days.indexOf(state.selectedDay).coerceAtLeast(0)) { days.size }
    val currentDays by rememberUpdatedState(days)
    LaunchedEffect(state.selectedDay) {
        val page = days.indexOf(state.selectedDay)
        if (page >= 0 && page != pager.settledPage) pager.animateScrollToPage(page)
    }
    // settledPage (not currentPage): mid-animation pages must not re-select a day and bounce the pager back.
    LaunchedEffect(pager) {
        snapshotFlow { pager.settledPage }.distinctUntilChanged().collect { currentDays.getOrNull(it)?.let(viewModel::selectDay) }
    }
    HorizontalPager(pager, Modifier.fillMaxSize()) { page ->
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
            DayPeriodsList(
                builder,
                days[page],
                state.canEdit,
                onOpen = { viewModel.lessons.open(days[page], it) },
                modifier = Modifier.widthIn(max = ContentMaxWidth),
            )
        }
    }
}

@Composable
private fun stateText(state: com.schoolapp.core.model.timetable.TimetableState): String = stringResource(
    when (state) {
        com.schoolapp.core.model.timetable.TimetableState.EMPTY -> R.string.tt_state_empty
        com.schoolapp.core.model.timetable.TimetableState.DRAFT -> R.string.timetable_state_draft
        com.schoolapp.core.model.timetable.TimetableState.PUBLISHED -> R.string.timetable_state_published
        com.schoolapp.core.model.timetable.TimetableState.PUBLISHED_WITH_CHANGES -> R.string.timetable_state_changes
    },
)
