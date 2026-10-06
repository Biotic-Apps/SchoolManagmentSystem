package com.schoolapp.feature.diary.supervisor

import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.diary.R

@Composable
internal fun SectionPickerSheet(
    sections: List<SwitcherOption>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.diary_pick_section), onDismiss = onDismiss) {
        LazyColumn(Modifier.heightIn(max = 480.dp)) {
            items(sections.size, key = { sections[it].id }) { index ->
                val option = sections[index]
                ListItemRow(title = option.label, selected = option.id == selectedId, onClick = { onSelect(option.id) })
            }
        }
    }
}

@Composable
internal fun ReturnEntrySheet(
    editor: ReturnEditor,
    onCommentChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.diary_return_title), onDismiss = onDismiss) {
        editor.subjectName?.let { InlineMessage(stringResource(R.string.diary_return_subject, it), StatusTone.Info) }
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextArea(
            value = editor.comment,
            onValueChange = onCommentChange,
            label = stringResource(R.string.diary_return_comment),
            enabled = !editor.isSaving,
            errorText = if (editor.commentMissing) stringResource(R.string.diary_return_comment_required) else null,
        )
        PrimaryButton(stringResource(R.string.diary_return_action), onSubmit, loading = editor.isSaving)
    }
}
