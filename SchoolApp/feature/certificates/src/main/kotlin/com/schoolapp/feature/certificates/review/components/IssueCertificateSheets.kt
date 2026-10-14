package com.schoolapp.feature.certificates.review.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.review.IssueForm
import com.schoolapp.feature.certificates.review.ReissueForm

/** Confirms issuing; leaving certificates also pick the leaving date (the student is withdrawn from it). */
@Composable
internal fun IssueCertificateSheet(form: IssueForm, onDateChange: (String) -> Unit, onSubmit: () -> Unit, onDismiss: () -> Unit) {
    var picking by rememberSaveable { mutableStateOf(false) }
    AppBottomSheet(title = stringResource(R.string.certificates_issue_title), onDismiss = onDismiss) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        Text(stringResource(R.string.certificates_issue_message), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextSecondary)
        if (form.isLeaving) {
            InlineMessage(stringResource(R.string.certificates_issue_leaving_message), StatusTone.Warning)
            PickerField(
                value = formatDate(form.effectiveDate) ?: form.effectiveDate,
                label = stringResource(R.string.certificates_effective_date),
                onClick = { picking = true },
                enabled = !form.isSaving,
            )
        }
        PrimaryButton(stringResource(R.string.certificates_issue), onSubmit, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
    if (picking) {
        AppDatePickerDialog(
            initialDate = form.effectiveDate,
            onConfirm = { onDateChange(it); picking = false },
            onDismiss = { picking = false },
        )
    }
}

@Composable
internal fun ReissueCertificateSheet(form: ReissueForm, onReasonChange: (String) -> Unit, onSubmit: () -> Unit, onDismiss: () -> Unit) {
    AppBottomSheet(title = stringResource(R.string.certificates_reissue_title), onDismiss = onDismiss) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        Text(stringResource(R.string.certificates_reissue_message), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextSecondary)
        AppTextArea(
            value = form.reason,
            onValueChange = onReasonChange,
            label = stringResource(R.string.certificates_reissue_reason_label),
            enabled = !form.isSaving,
            errorText = if (form.reasonMissing) stringResource(R.string.certificates_reissue_reason_required) else null,
        )
        PrimaryButton(stringResource(R.string.certificates_reissue), onSubmit, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}
