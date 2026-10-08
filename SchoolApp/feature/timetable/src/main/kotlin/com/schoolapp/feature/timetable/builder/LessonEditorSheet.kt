package com.schoolapp.feature.timetable.builder

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R

/** Subject (with what is left), teacher (pre-filled, busy/load hints), room (+ New room); saved right away. */
@Composable
internal fun LessonEditorSheet(state: BuilderUiState, viewModel: TimetableBuilderViewModel) {
    val editor = state.editor ?: return
    val builder = state.builder ?: return
    val controller = viewModel.lessons
    val period = builder.draft.periodsFor(editor.day).firstOrNull { it.index == editor.periodIndex }
    val title = stringResource(
        R.string.tt_lesson_title,
        stringResource(dayNameRes(editor.day)),
        period?.number ?: editor.periodIndex,
    )
    val busyNow = builder.busy.filter { it.day == editor.day && it.periodIndex == editor.periodIndex }
    val lesson = builder.lessons.firstOrNull { it.subject.id == editor.subjectId }
    AppBottomSheet(title = title, onDismiss = controller::close) {
        Text(
            listOfNotNull(period?.let(::timeRange), "${builder.className} ${builder.sectionName}").joinToString(" · "),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        if (builder.lessons.isEmpty()) {
            InlineMessage(stringResource(R.string.tt_no_subjects), StatusTone.Warning)
        }
        CreatablePickerField(
            label = stringResource(R.string.tt_subject),
            options = subjectOptions(builder.lessons),
            selectedId = editor.subjectId,
            onSelect = { it?.let(controller::setSubject) },
            errorText = if (editor.showErrors && editor.subjectId == null) stringResource(R.string.tt_pick_subject) else null,
        )
        CreatablePickerField(
            label = stringResource(R.string.tt_teacher),
            options = staffOptions(builder, state.staff, lesson, busyNow),
            selectedId = editor.staffId,
            onSelect = controller::setStaff,
            errorText = if (editor.showErrors && editor.staffId == null) stringResource(R.string.tt_pick_teacher) else null,
            fallbackValue = builder.draft.slotAt(editor.day, editor.periodIndex)?.staff?.name,
        )
        busyNow.firstOrNull { it.staffId != null && it.staffId == editor.staffId }?.let {
            InlineMessage(stringResource(R.string.tt_teacher_busy, it.sectionName), StatusTone.Warning)
        }
        if (controller.canAllocate(state) && lesson != null) {
            SwitchRow(
                title = stringResource(R.string.tt_allocate, lesson.subject.name, "${builder.className} ${builder.sectionName}"),
                checked = editor.allocate,
                onCheckedChange = controller::setAllocate,
            )
        }
        CreatablePickerField(
            label = stringResource(R.string.tt_room),
            options = builder.rooms.map { PickerOption(it.id, it.name) },
            selectedId = editor.roomId,
            onSelect = controller::setRoom,
            noneLabel = stringResource(R.string.tt_no_room),
            onCreate = viewModel::createRoom,
            createLabel = { stringResource(R.string.tt_new_room_named, it) },
        )
        busyNow.firstOrNull { it.roomId != null && it.roomId == editor.roomId }?.let {
            InlineMessage(stringResource(R.string.tt_room_busy, it.sectionName), StatusTone.Warning)
        }
        Text(stringResource(R.string.tt_saved_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            if (editor.existing) {
                SecondaryButton(
                    stringResource(R.string.tt_remove_lesson),
                    onClick = viewModel::removeLesson,
                    leadingIcon = Icons.Outlined.Delete,
                    modifier = Modifier.weight(1f),
                )
            }
            PrimaryButton(stringResource(R.string.tt_save_lesson), onClick = viewModel::saveLesson, modifier = Modifier.weight(1f))
        }
    }
}

/** ISO weekday name resource (1 = Monday). */
internal fun dayNameRes(day: Int): Int = when (day) {
    1 -> R.string.tt_day_mon
    2 -> R.string.tt_day_tue
    3 -> R.string.tt_day_wed
    4 -> R.string.tt_day_thu
    5 -> R.string.tt_day_fri
    6 -> R.string.tt_day_sat
    else -> R.string.tt_day_sun
}
