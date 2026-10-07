package com.schoolapp.feature.complaints.detail.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.selection.selectable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.detail.AssignEditor
import com.schoolapp.feature.complaints.detail.AssigneeOption

/** Supervisor picks the staff login responsible for the complaint; the list is searchable by name or designation. */
@Composable
internal fun AssignSheet(
    editor: AssignEditor,
    onQueryChange: (String) -> Unit,
    onSelect: (String) -> Unit,
    onRetry: () -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.complaints_assign), onDismiss = onDismiss) {
        Text(stringResource(R.string.complaints_assign_help), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        when {
            editor.isLoading -> LoadingState()
            editor.loadError != null -> {
                InlineMessage(appErrorMessage(editor.loadError), StatusTone.Error)
                AppTextButton(stringResource(R.string.complaints_assign_retry), onRetry)
            }
            editor.candidates.isEmpty() -> InlineMessage(stringResource(R.string.complaints_assign_empty), StatusTone.Info)
            else -> {
                SearchField(editor.query, onQueryChange, placeholder = stringResource(R.string.complaints_assign_search))
                if (editor.selectionMissing) InlineMessage(stringResource(R.string.complaints_assign_pick), StatusTone.Error)
                Column {
                    editor.visible.forEach { option ->
                        AssigneeRow(
                            option = option,
                            selected = option.userId == editor.selectedUserId,
                            isCurrent = option.userId == editor.currentAssigneeId,
                            enabled = !editor.isSaving,
                            onSelect = onSelect,
                        )
                    }
                }
            }
        }
        PrimaryButton(
            stringResource(R.string.complaints_assign),
            onSave,
            loading = editor.isSaving,
            enabled = !editor.isLoading && editor.candidates.isNotEmpty(),
        )
    }
}

@Composable
private fun AssigneeRow(option: AssigneeOption, selected: Boolean, isCurrent: Boolean, enabled: Boolean, onSelect: (String) -> Unit) {
    val current = stringResource(R.string.complaints_assign_current)
    ListItemRow(
        title = option.name,
        supporting = listOfNotNull(option.designation, current.takeIf { isCurrent }).joinToString(" · ").ifBlank { null },
        selected = selected,
        modifier = Modifier.selectable(selected = selected, enabled = enabled, role = Role.RadioButton, onClick = { onSelect(option.userId) }),
        leading = { PersonAvatar(name = option.name, photoUrl = null) },
        trailing = if (selected) {
            { Icon(Icons.Outlined.CheckCircle, contentDescription = null, tint = AppColors.Primary) }
        } else {
            null
        },
    )
}
