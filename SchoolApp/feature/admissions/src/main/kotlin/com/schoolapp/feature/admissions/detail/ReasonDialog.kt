package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admissions.R

/** Confirm with a reason or note: decide, withdraw, verify or reject a document. */
@Composable
internal fun ReasonDialog(
    title: String,
    confirmLabel: String,
    busy: Boolean,
    error: AppError?,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
    message: String? = null,
    label: String = stringResource(R.string.admissions_reason),
    required: Boolean = false,
    destructive: Boolean = false,
) {
    var reason by rememberSaveable { mutableStateOf("") }
    var showProblem by rememberSaveable { mutableStateOf(false) }
    val problem = ActionForms.reasonProblem(reason, required)
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AppColors.Surface,
        shape = MaterialTheme.shapes.medium,
        title = { Text(title, style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                message?.let { Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary) }
                AppTextArea(
                    value = reason,
                    onValueChange = { reason = it.take(REASON_MAX) },
                    label = label,
                    enabled = !busy,
                    supportingText = if (required) null else stringResource(R.string.admissions_new_optional),
                    errorText = if (showProblem) problem?.let { actionProblemText(it) } else null,
                )
                error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            }
        },
        confirmButton = {
            AppTextButton(
                text = confirmLabel,
                onClick = { if (problem != null) showProblem = true else onConfirm(reason.trim()) },
                loading = busy,
                contentColor = if (destructive) AppColors.Error else AppColors.Primary,
            )
        },
        dismissButton = {
            AppTextButton(text = stringResource(android.R.string.cancel), onClick = onDismiss, enabled = !busy, contentColor = AppColors.TextSecondary)
        },
    )
}

@Composable
internal fun actionProblemText(problem: ActionProblem): String = stringResource(
    when (problem) {
        ActionProblem.REQUIRED -> R.string.admissions_required
        ActionProblem.NOT_A_NUMBER -> R.string.admissions_not_a_number
        ActionProblem.MAX_NOT_POSITIVE -> R.string.admissions_max_positive
        ActionProblem.SCORE_ABOVE_MAX -> R.string.admissions_score_above_max
        ActionProblem.TOO_SHORT -> R.string.admissions_reason_short
    },
)

private const val REASON_MAX = 500
