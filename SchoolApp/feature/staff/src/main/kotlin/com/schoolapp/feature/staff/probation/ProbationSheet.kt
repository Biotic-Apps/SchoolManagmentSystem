package com.schoolapp.feature.staff.probation

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.OptionPickerField

@Composable
internal fun ProbationSheet(
    state: ProbationState,
    onRequiresReview: (Boolean) -> Unit,
    onReviewer: (String) -> Unit,
    onRetryReviewers: () -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !state.isSaving
    AppBottomSheet(title = stringResource(R.string.staff_probation_title), onDismiss = { if (enabled) onDismiss() }) {
        Text(
            stringResource(R.string.staff_probation_explain, state.staffName),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        state.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SwitchRow(
            title = stringResource(R.string.staff_probation_requires_review),
            checked = state.requiresReview,
            onCheckedChange = onRequiresReview,
            enabled = enabled,
        )
        if (state.requiresReview) ReviewerField(state, onReviewer, onRetryReviewers, enabled)
        PrimaryButton(stringResource(R.string.staff_probation_save), onSubmit, loading = state.isSaving)
    }
}

@Composable
private fun ReviewerField(state: ProbationState, onReviewer: (String) -> Unit, onRetry: () -> Unit, enabled: Boolean) {
    val error = state.reviewersError
    when {
        error != null -> {
            InlineMessage(appErrorMessage(error), StatusTone.Error)
            AppTextButton(text = stringResource(R.string.staff_retry), onClick = onRetry)
        }
        state.noReviewers -> InlineMessage(stringResource(R.string.staff_probation_no_reviewers), StatusTone.Warning)
        else -> {
            OptionPickerField(
                label = stringResource(if (state.reviewersLoading) R.string.staff_probation_reviewers_loading else R.string.staff_probation_reviewer_label),
                options = state.reviewers,
                selectedId = state.reviewerUserId,
                onSelect = onReviewer,
                enabled = enabled && !state.reviewersLoading,
                errorText = if (state.reviewerMissing) stringResource(R.string.staff_probation_reviewer_missing) else null,
            )
            Text(
                stringResource(R.string.staff_probation_reviewer_hint),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
    }
}
