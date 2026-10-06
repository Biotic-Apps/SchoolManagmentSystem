package com.schoolapp.feature.certificates.review.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.review.RejectForm

@Composable
internal fun RejectCertificateSheet(
    form: RejectForm,
    onReasonChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.certificates_reject_title), onDismiss = onDismiss) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextArea(
            value = form.reason,
            onValueChange = onReasonChange,
            label = stringResource(R.string.certificates_reject_reason),
            enabled = !form.isSaving,
            errorText = if (form.reasonMissing) stringResource(R.string.certificates_reject_reason_required) else null,
        )
        PrimaryButton(stringResource(R.string.certificates_reject), onSubmit, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}
