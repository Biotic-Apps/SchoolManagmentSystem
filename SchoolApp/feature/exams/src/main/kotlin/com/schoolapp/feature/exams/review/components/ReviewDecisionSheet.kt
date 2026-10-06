package com.schoolapp.feature.exams.review.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.review.ReviewDecision
import com.schoolapp.feature.exams.review.ReviewKind

/** Accept (optional comment) or Return (comment required) a submitted mark sheet. */
@Composable
internal fun ReviewDecisionSheet(
    decision: ReviewDecision,
    sheetTitle: String,
    onCommentChange: (String) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    val accept = decision.kind == ReviewKind.ACCEPT
    AppBottomSheet(
        title = stringResource(if (accept) R.string.exams_accept_title else R.string.exams_return_title, sheetTitle),
        onDismiss = onDismiss,
    ) {
        decision.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        InlineMessage(stringResource(if (accept) R.string.exams_accept_hint else R.string.exams_return_hint), StatusTone.Info)
        AppTextArea(
            value = decision.comment,
            onValueChange = onCommentChange,
            label = stringResource(if (accept) R.string.exams_comment_optional else R.string.exams_comment_required),
            errorText = if (decision.commentMissing) stringResource(R.string.exams_return_comment_missing) else null,
            enabled = !decision.isSaving,
        )
        PrimaryButton(
            text = stringResource(if (accept) R.string.exams_accept else R.string.exams_return),
            onClick = onConfirm,
            loading = decision.isSaving,
            enabled = !decision.isSaving,
        )
    }
}
