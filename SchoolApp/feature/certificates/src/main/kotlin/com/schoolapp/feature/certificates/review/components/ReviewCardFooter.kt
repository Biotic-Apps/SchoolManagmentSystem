package com.schoolapp.feature.certificates.review.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.WorkspacePremium
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.components.CertificatePdf
import com.schoolapp.feature.certificates.components.CertificatePdfActions
import com.schoolapp.feature.certificates.components.pdfOf
import com.schoolapp.feature.certificates.review.CertificateReviewUiState
import com.schoolapp.feature.certificates.review.ReviewActionsCallbacks

/** Per-status actions: approve / reject, issue, or the PDF (open, share, check again) plus reissue for originals. */
@Composable
internal fun ReviewCardFooter(certificate: Certificate, state: CertificateReviewUiState, actions: ReviewActionsCallbacks) {
    state.blocked[certificate.id]?.let { ClearanceBlockedMessage(it, Modifier.padding(top = 8.dp)) }
    val busy = certificate.id in state.busyIds
    when (certificate.status) {
        CertificateStatus.REQUESTED -> if (state.canApprove) {
            ReviewActions(busy = busy, onApprove = { actions.onApprove(certificate.id) }, onReject = { actions.onReject(certificate.id) })
        }
        CertificateStatus.APPROVED -> if (state.canIssue) {
            PrimaryButton(
                text = stringResource(R.string.certificates_issue),
                onClick = { actions.onIssue(certificate.id) },
                leadingIcon = Icons.Outlined.WorkspacePremium,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            )
        }
        CertificateStatus.ISSUED -> {
            val pdf = pdfOf(certificate, state.pdf[certificate.id])
            CertificatePdfActions(certificate, pdf, onCheckAgain = { actions.onCheckPdf(certificate.id) })
            if (state.canIssue && !certificate.duplicate && pdf != CertificatePdf.Preparing) {
                SecondaryButton(
                    text = stringResource(R.string.certificates_reissue),
                    onClick = { actions.onReissue(certificate.id) },
                    leadingIcon = Icons.Outlined.ContentCopy,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                )
            }
        }
        CertificateStatus.REJECTED -> Unit
    }
}
