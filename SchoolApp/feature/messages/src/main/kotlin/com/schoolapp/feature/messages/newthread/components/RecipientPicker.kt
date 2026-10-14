package com.schoolapp.feature.messages.newthread.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountBalance
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.School
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.message.MessageRecipient
import com.schoolapp.core.model.message.RecipientRole
import com.schoolapp.feature.messages.R

/** Parent picks who receives the message; nothing picked = the class teacher (server default). */
@Composable
internal fun RecipientPicker(
    recipients: List<MessageRecipient>,
    selectedUserId: String?,
    isLoading: Boolean,
    error: AppError?,
    enabled: Boolean,
    onSelect: (String?) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.messages_to))
        when {
            isLoading -> LoadingState(rows = 2)
            error != null -> InlineMessage(stringResource(R.string.messages_recipients_error), StatusTone.Warning)
            else -> {
                ListItemRow(
                    title = stringResource(R.string.messages_to_default),
                    supporting = stringResource(R.string.messages_to_default_hint),
                    leadingIcon = Icons.Outlined.School,
                    selected = selectedUserId == null,
                    onClick = if (enabled) ({ onSelect(null) }) else null,
                )
                recipients.forEach { recipient ->
                    ListItemRow(
                        title = recipient.name,
                        supporting = recipient.subjectName ?: roleLabel(recipient.role),
                        leadingIcon = if (recipient.role == RecipientRole.PRINCIPAL) Icons.Outlined.AccountBalance else Icons.Outlined.Person,
                        selected = selectedUserId == recipient.userId,
                        onClick = if (enabled) ({ onSelect(recipient.userId) }) else null,
                    )
                }
            }
        }
    }
}

@Composable
private fun roleLabel(role: RecipientRole): String = stringResource(
    when (role) {
        RecipientRole.CLASS_TEACHER -> R.string.messages_role_class_teacher
        RecipientRole.PRINCIPAL -> R.string.messages_role_principal
        RecipientRole.SUBJECT_TEACHER, RecipientRole.OTHER -> R.string.messages_role_teacher
    },
)
