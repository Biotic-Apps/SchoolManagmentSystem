package com.schoolapp.feature.students.detail.documents

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R

/** Confirm verify (optional note) or reject (required reason). */
@Composable
internal fun DocumentDecisionDialog(
    decision: DocumentDecision,
    onTextChange: (String) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    val reject = decision.kind == DecisionKind.REJECT
    val busy = decision.isSaving
    val invalid = decision.showErrors && !decision.isTextValid
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AppColors.Surface,
        shape = MaterialTheme.shapes.medium,
        title = {
            Text(
                stringResource(if (reject) R.string.sd_docs_reject_title else R.string.sd_docs_verify_title),
                style = MaterialTheme.typography.titleLarge,
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                AppTextArea(
                    value = decision.text,
                    onValueChange = onTextChange,
                    label = stringResource(if (reject) R.string.sd_docs_reject_reason else R.string.sd_docs_verify_note),
                    enabled = !busy,
                    minLines = 2,
                    errorText = when {
                        !invalid -> null
                        reject -> stringResource(R.string.sd_docs_reason_length)
                        else -> stringResource(R.string.sd_docs_verify_note_too_long)
                    },
                )
                decision.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            }
        },
        confirmButton = {
            AppTextButton(
                text = stringResource(if (reject) R.string.sd_docs_reject else R.string.sd_docs_verify),
                onClick = onConfirm,
                loading = busy,
                contentColor = if (reject) AppColors.Error else AppColors.Primary,
            )
        },
        dismissButton = {
            AppTextButton(stringResource(R.string.sd_docs_cancel), onDismiss, enabled = !busy, contentColor = AppColors.TextSecondary)
        },
    )
}
