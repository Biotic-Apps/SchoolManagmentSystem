package com.schoolapp.feature.messages.newthread

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.messages.R
import com.schoolapp.feature.messages.newthread.components.GuardianRecipients
import com.schoolapp.feature.messages.newthread.components.SelectedStudentCard
import com.schoolapp.feature.messages.newthread.components.StudentSearch

internal class NewThreadActions(
    val onChildSelected: (String) -> Unit,
    val onQueryChange: (String) -> Unit,
    val onStudentSelected: (StudentSummary) -> Unit,
    val onClearStudent: () -> Unit,
    val onSubjectChange: (String) -> Unit,
    val onBodyChange: (String) -> Unit,
    val onSubmit: () -> Unit,
)

@Composable
internal fun NewThreadScreen(state: NewThreadUiState, actions: NewThreadActions, modifier: Modifier = Modifier) {
    ScreenColumn(modifier.imePadding()) {
        if (state.isParent) parentRecipient(state, actions) else staffRecipient(state, actions)
        item(key = "divider") {
            HorizontalDivider(
                color = AppColors.Border,
                modifier = Modifier.padding(vertical = 8.dp),
            )
        }
        item(key = "subject") {
            AppTextField(
                value = state.subject,
                onValueChange = actions.onSubjectChange,
                label = stringResource(R.string.messages_subject),
                errorText = if (state.subjectMissing) stringResource(R.string.messages_required) else null,
                enabled = !state.isSubmitting,
            )
        }
        item(key = "body") {
            AppTextArea(
                value = state.body,
                onValueChange = actions.onBodyChange,
                label = stringResource(R.string.messages_body),
                errorText = if (state.bodyMissing) stringResource(R.string.messages_required) else null,
                enabled = !state.isSubmitting,
            )
        }
        state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        item(key = "hint_compose") {
            Text(
                text = stringResource(R.string.messages_compose_hint),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary.copy(alpha = 0.7f),
                modifier = Modifier.padding(horizontal = 4.dp),
            )
        }
        item(key = "send") {
            PrimaryButton(
                text = stringResource(R.string.messages_send),
                onClick = actions.onSubmit,
                loading = state.isSubmitting,
                leadingIcon = Icons.AutoMirrored.Outlined.Send,
            )
        }
    }
}

private fun LazyListScope.parentRecipient(state: NewThreadUiState, actions: NewThreadActions) {
    item(key = "child") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionHeader(stringResource(R.string.messages_child))
            if (state.children.isEmpty()) {
                InlineMessage(stringResource(R.string.messages_no_children), StatusTone.Warning)
            } else {
                FilterChipRow(
                    options = state.children.map { SwitcherOption(it.id, it.fullName) },
                    selectedId = state.selectedChildId,
                    onSelect = actions.onChildSelected,
                )
            }
            if (state.studentMissing) InlineMessage(stringResource(R.string.messages_pick_child), StatusTone.Error)
        }
    }
    item(key = "hint") { InlineMessage(stringResource(R.string.messages_parent_recipient_hint), StatusTone.Info) }
}

private fun LazyListScope.staffRecipient(state: NewThreadUiState, actions: NewThreadActions) {
    val student = state.student
    if (student == null) {
        item(key = "search") {
            StudentSearch(
                query = state.query,
                isSearching = state.isSearching,
                results = state.results,
                error = state.searchError,
                missing = state.studentMissing,
                onQueryChange = actions.onQueryChange,
                onSelect = actions.onStudentSelected,
            )
        }
    } else {
        item(key = "student") { SelectedStudentCard(student, onChange = actions.onClearStudent) }
        item(key = "recipients") { GuardianRecipients(state.guardians, state.isLoadingGuardians) }
    }
}
