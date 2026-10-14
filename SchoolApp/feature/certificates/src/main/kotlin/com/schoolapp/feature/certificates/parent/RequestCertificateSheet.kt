package com.schoolapp.feature.certificates.parent

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.components.WrapChoiceChips
import com.schoolapp.feature.certificates.components.certificateTypeLabel
import com.schoolapp.feature.certificates.components.needsClearance

@Composable
internal fun RequestCertificateSheet(
    form: RequestForm,
    childName: String?,
    onTypeChange: (CertificateType) -> Unit,
    onPurposeChange: (String) -> Unit,
    onAchievementChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.certificates_request), onDismiss = onDismiss) {
        childName?.let {
            Text(stringResource(R.string.certificates_request_for, it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SectionHeader(title = stringResource(R.string.certificates_type))
        WrapChoiceChips(
            options = CertificateType.entries.map { SwitcherOption(it.name, certificateTypeLabel(it)) },
            selectedId = form.type?.name,
            onSelect = { onTypeChange(CertificateType.valueOf(it)) },
            enabled = !form.isSaving,
        )
        if (form.typeMissing) {
            Text(stringResource(R.string.certificates_type_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
        if (form.type?.needsClearance() == true) {
            InlineMessage(stringResource(R.string.certificates_clearance_note), StatusTone.Info)
        }
        if (form.type == CertificateType.ACHIEVEMENT) {
            AppTextArea(
                value = form.achievement,
                onValueChange = onAchievementChange,
                label = stringResource(R.string.certificates_achievement),
                enabled = !form.isSaving,
                errorText = if (form.achievementMissing) stringResource(R.string.certificates_achievement_required) else null,
            )
        }
        AppTextArea(
            value = form.purpose,
            onValueChange = onPurposeChange,
            label = stringResource(R.string.certificates_purpose_optional),
            enabled = !form.isSaving,
        )
        PrimaryButton(stringResource(R.string.certificates_send_request), onSubmit, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}
