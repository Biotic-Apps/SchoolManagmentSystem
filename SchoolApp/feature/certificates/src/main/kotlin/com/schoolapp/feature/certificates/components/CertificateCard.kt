package com.schoolapp.feature.certificates.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.certificates.R

/**
 * Type + status header and the request's details. [showStudent] adds the student and class (office view);
 * [footer] holds role-specific actions (download, approve/reject).
 */
@Composable
internal fun CertificateCard(
    certificate: Certificate,
    modifier: Modifier = Modifier,
    showStudent: Boolean = false,
    footer: @Composable ColumnScope.() -> Unit = {},
) {
    AppCard(modifier = modifier) {
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                certificateTypeLabel(certificate.type),
                style = MaterialTheme.typography.titleMedium,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            StatusChip(certificateStatusLabel(certificate.status), certificate.status.tone())
        }
        if (certificate.duplicate) {
            StatusChip(stringResource(R.string.certificates_duplicate), StatusTone.Neutral)
        }
        if (showStudent) {
            KeyValueRow(stringResource(R.string.certificates_student), studentLine(certificate))
            KeyValueRow(stringResource(R.string.certificates_requested_by), certificate.requestedBy?.name)
        }
        certificate.serial?.let { KeyValueRow(stringResource(R.string.certificates_serial), it) }
        certificate.purpose?.let { KeyValueRow(stringResource(R.string.certificates_purpose), it) }
        KeyValueRow(stringResource(R.string.certificates_requested_on), formatTimestamp(certificate.createdAt))
        if (certificate.status == CertificateStatus.ISSUED) {
            KeyValueRow(stringResource(R.string.certificates_issued_on), formatDate(certificate.issuedOn) ?: certificate.issuedOn)
        }
        if (certificate.status == CertificateStatus.REJECTED) {
            certificate.reason?.let { KeyValueRow(stringResource(R.string.certificates_rejection_reason), it) }
        }
        footer()
    }
}

@Composable
private fun studentLine(certificate: Certificate): String {
    val className = certificate.className
    val sectionName = certificate.sectionName
    val classSection = when {
        className != null && sectionName != null -> stringResource(R.string.certificates_class_section, className, sectionName)
        else -> className ?: sectionName
    }
    return listOfNotNull(certificate.studentName.takeIf { it.isNotBlank() }, classSection).joinToString(" · ")
}
