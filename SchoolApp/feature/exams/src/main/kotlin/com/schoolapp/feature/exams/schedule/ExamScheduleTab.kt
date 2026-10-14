package com.schoolapp.feature.exams.schedule

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.schedule.components.PaperEditorSheet
import com.schoolapp.feature.exams.schedule.components.PaperRowCard

/** Date sheet of the exam grouped by class; editable until marks entry opens (`exams.edit`). */
@Composable
internal fun ExamScheduleTab(
    exam: ExamDetail,
    onExamChanged: (ExamDetail) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ScheduleViewModel = hiltViewModel(key = "exam_schedule_${exam.id}"),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    LaunchedEffect(exam) { viewModel.start(exam) }
    val editor = viewModel.editor
    Column(modifier.fillMaxSize()) {
        ScreenColumn(Modifier.weight(1f)) {
            item(key = "notice") { InlineMessage(stringResource(noticeText(state)), StatusTone.Info) }
            if (state.saved) item(key = "saved") { InlineMessage(stringResource(R.string.exams_schedule_saved), StatusTone.Success) }
            state.saveError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            if (state.noPapers) item(key = "no_papers") { InlineMessage(stringResource(R.string.exams_schedule_need_paper), StatusTone.Error) }
            state.generalErrors.forEachIndexed { index, text -> item(key = "general_$index") { InlineMessage(text, StatusTone.Error) } }
            state.groups.forEach { group ->
                item(key = "class_${group.classId}") {
                    SectionHeader(
                        title = group.className.ifBlank { stringResource(R.string.exams_schedule_class_fallback) },
                        action = if (state.readOnly) null else {
                            { AppTextButton(stringResource(R.string.exams_schedule_add_paper), { editor.openNew(group.classId) }, leadingIcon = Icons.Outlined.Add) }
                        },
                    )
                }
                if (group.rows.isEmpty()) {
                    item(key = "empty_${group.classId}") {
                        Text(stringResource(R.string.exams_schedule_no_papers), color = AppColors.TextSecondary)
                    }
                }
                items(group.rows, key = { it.key }) { row ->
                    PaperRowCard(
                        row = row,
                        subjectName = state.subjectName(row),
                        roomName = state.roomName(row),
                        problems = state.rowProblems[row.key].orEmpty(),
                        clashes = state.rowClashes[row.key].orEmpty(),
                        onClick = if (state.readOnly) null else ({ editor.openEdit(row.key) }),
                        onRemove = if (state.readOnly) null else ({ viewModel.requestRemove(row.key) }),
                    )
                }
            }
        }
        if (state.canSave) SaveBar(state, onSave = { viewModel.save(onExamChanged) }, onDiscard = viewModel::requestDiscard)
    }
    state.draft?.let { draft ->
        PaperEditorSheet(draft, state.subjects[draft.row.classId].orEmpty(), state.rooms, editor)
    }
    if (state.confirmRemoveKey != null) {
        ConfirmDialog(
            title = stringResource(R.string.exams_schedule_remove_title),
            message = stringResource(R.string.exams_schedule_remove_message),
            confirmLabel = stringResource(R.string.exams_schedule_remove),
            onConfirm = viewModel::confirmRemove,
            onDismiss = viewModel::dismissRemove,
            destructive = true,
        )
    }
    if (state.confirmDiscard) {
        ConfirmDialog(
            title = stringResource(R.string.exams_schedule_discard_title),
            message = stringResource(R.string.exams_schedule_discard_message),
            confirmLabel = stringResource(R.string.exams_schedule_discard),
            onConfirm = { viewModel.discard(exam) },
            onDismiss = viewModel::dismissDiscard,
            destructive = true,
        )
    }
}

@Composable
private fun SaveBar(state: ScheduleState, onSave: () -> Unit, onDiscard: () -> Unit) {
    Surface(Modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Row(
                Modifier.navigationBarsPadding().padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                if (state.dirty) {
                    SecondaryButton(stringResource(R.string.exams_schedule_discard), onDiscard, Modifier.weight(1f), enabled = !state.isSaving)
                }
                PrimaryButton(stringResource(R.string.exams_schedule_save), onSave, Modifier.weight(1f), loading = state.isSaving)
            }
        }
    }
}

private fun noticeText(state: ScheduleState): Int = when {
    !state.readOnly -> R.string.exams_schedule_notice_edit
    state.canEdit -> R.string.exams_schedule_notice_locked
    else -> R.string.exams_schedule_notice_view
}
