package com.schoolapp.feature.students.guardians

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.students.R

/** Reject a child-link request; the optional reason is shown to the parent. */
@Composable
internal fun RejectLinkSheet(
    request: ChildLinkRequest,
    reason: String,
    saving: Boolean,
    error: ActionError?,
    onReason: (String) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(stringResource(R.string.students_reject_link_title), onDismiss) {
        InlineMessage(
            stringResource(R.string.students_reject_link_message, request.guardianName.orEmpty(), request.studentName.orEmpty()),
            StatusTone.Warning,
        )
        AppTextArea(
            value = reason,
            onValueChange = { if (it.length <= REASON_MAX) onReason(it) },
            label = stringResource(R.string.students_reason_optional),
            supportingText = stringResource(R.string.students_reject_link_reason_hint),
        )
        error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
        PrimaryButton(stringResource(R.string.students_reject), onConfirm, Modifier.fillMaxWidth(), loading = saving)
    }
}

private const val REASON_MAX = 1000
