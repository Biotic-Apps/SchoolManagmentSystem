package com.schoolapp.feature.certificates.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.feature.certificates.R

@Composable
@ReadOnlyComposable
internal fun certificateTypeLabel(type: CertificateType): String = stringResource(
    when (type) {
        CertificateType.SCHOOL_LEAVING -> R.string.certificates_type_school_leaving
        CertificateType.TRANSFER -> R.string.certificates_type_transfer
        CertificateType.CHARACTER -> R.string.certificates_type_character
        CertificateType.ATTENDANCE -> R.string.certificates_type_attendance
        CertificateType.ACHIEVEMENT -> R.string.certificates_type_achievement
    },
)

@Composable
@ReadOnlyComposable
internal fun certificateStatusLabel(status: CertificateStatus): String = stringResource(
    when (status) {
        CertificateStatus.REQUESTED -> R.string.certificates_status_requested
        CertificateStatus.APPROVED -> R.string.certificates_status_approved
        CertificateStatus.REJECTED -> R.string.certificates_status_rejected
        CertificateStatus.ISSUED -> R.string.certificates_status_issued
    },
)

internal fun CertificateStatus.tone(): StatusTone = when (this) {
    CertificateStatus.REQUESTED -> StatusTone.Info
    CertificateStatus.APPROVED, CertificateStatus.ISSUED -> StatusTone.Success
    CertificateStatus.REJECTED -> StatusTone.Error
}

internal fun CertificateType.needsClearance(): Boolean = this == CertificateType.SCHOOL_LEAVING || this == CertificateType.TRANSFER
