package com.schoolapp.feature.exams.schedule.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.OptionPickerField
import com.schoolapp.feature.exams.schedule.PaperDraft
import com.schoolapp.feature.exams.schedule.PaperEditor
import com.schoolapp.feature.exams.schedule.RowProblem

private enum class Picking { DATE, START, END }

/** Subject, date, 12-hour start / end, max and pass marks and an optional room for one paper. */
@Composable
internal fun PaperEditorSheet(draft: PaperDraft, subjects: List<PersonRef>, rooms: List<PersonRef>, editor: PaperEditor) {
    var picking by rememberSaveable { mutableStateOf<Picking?>(null) }
    val row = draft.row
    val problems = draft.problems
    val title = stringResource(if (draft.isNew) R.string.exams_schedule_new_paper else R.string.exams_schedule_edit_paper)
    AppBottomSheet(title = title, onDismiss = editor::dismiss) {
        OptionPickerField(
            label = stringResource(R.string.exams_schedule_subject),
            options = subjects.mapNotNull { s -> s.id?.let { SwitcherOption(it, s.name) } },
            selectedId = row.subjectId.ifBlank { null },
            onSelect = editor::onSubject,
            errorText = problems.firstOrNull { it == RowProblem.SUBJECT_MISSING || it == RowProblem.SUBJECT_TWICE }?.let { problemText(it) },
        )
        PickerField(
            value = formatDate(row.date).orEmpty(),
            label = stringResource(R.string.exams_schedule_date),
            onClick = { picking = Picking.DATE },
            errorText = if (RowProblem.DATE_MISSING in problems) problemText(RowProblem.DATE_MISSING) else null,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PickerField(
                value = formatTime(row.startTime).orEmpty(),
                label = stringResource(R.string.exams_schedule_start),
                onClick = { picking = Picking.START },
                icon = Icons.Outlined.Schedule,
                modifier = Modifier.weight(1f),
            )
            PickerField(
                value = formatTime(row.endTime).orEmpty(),
                label = stringResource(R.string.exams_schedule_end),
                onClick = { picking = Picking.END },
                icon = Icons.Outlined.Schedule,
                modifier = Modifier.weight(1f),
            )
        }
        if (RowProblem.END_BEFORE_START in problems) {
            Text(problemText(RowProblem.END_BEFORE_START), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            AppTextField(
                value = row.maxMarks,
                onValueChange = editor::onMax,
                label = stringResource(R.string.exams_schedule_max),
                kind = FieldKind.Number,
                modifier = Modifier.weight(1f),
                errorText = if (RowProblem.MAX_INVALID in problems) problemText(RowProblem.MAX_INVALID) else null,
            )
            AppTextField(
                value = row.passMarks,
                onValueChange = editor::onPass,
                label = stringResource(R.string.exams_schedule_pass),
                kind = FieldKind.Number,
                modifier = Modifier.weight(1f),
                errorText = problems.firstOrNull { it == RowProblem.PASS_INVALID || it == RowProblem.PASS_ABOVE_MAX }?.let { problemText(it) },
            )
        }
        val noRoom = SwitcherOption(NO_ROOM, stringResource(R.string.exams_schedule_no_room))
        OptionPickerField(
            label = stringResource(R.string.exams_schedule_room),
            options = listOf(noRoom) + rooms.mapNotNull { r -> r.id?.let { SwitcherOption(it, r.name) } },
            selectedId = row.roomId ?: NO_ROOM,
            onSelect = { editor.onRoom(it.takeIf { id -> id != NO_ROOM }) },
        )
        PrimaryButton(stringResource(R.string.exams_schedule_done), editor::commit, Modifier.fillMaxWidth())
    }
    when (picking) {
        Picking.DATE -> AppDatePickerDialog(
            initialDate = row.date.ifBlank { null },
            onConfirm = { editor.onDate(it); picking = null },
            onDismiss = { picking = null },
        )
        Picking.START -> AppTimePickerDialog(
            initialTime = row.startTime,
            onConfirm = { editor.onStart(it); picking = null },
            onDismiss = { picking = null },
            title = stringResource(R.string.exams_schedule_start),
        )
        Picking.END -> AppTimePickerDialog(
            initialTime = row.endTime,
            onConfirm = { editor.onEnd(it); picking = null },
            onDismiss = { picking = null },
            title = stringResource(R.string.exams_schedule_end),
        )
        null -> Unit
    }
}

private const val NO_ROOM = "none"
