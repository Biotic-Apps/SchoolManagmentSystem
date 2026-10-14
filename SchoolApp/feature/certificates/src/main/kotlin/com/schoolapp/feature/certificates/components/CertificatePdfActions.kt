package com.schoolapp.feature.certificates.components

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Share
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.certificates.R

/** PDF of an issued certificate: preparing, ready (open / share) or not ready yet (check again). */
sealed interface CertificatePdf {
    data object Preparing : CertificatePdf
    data class Ready(val url: String) : CertificatePdf
    data object Pending : CertificatePdf
    data object Failed : CertificatePdf
}

/** What to show for [certificate] given the polled [polled] state (wins over the list's fileUrl). */
internal fun pdfOf(certificate: Certificate, polled: CertificatePdf?): CertificatePdf =
    polled ?: certificate.fileUrl?.takeIf { it.isNotBlank() }?.let { CertificatePdf.Ready(it) } ?: CertificatePdf.Pending

@Composable
internal fun CertificatePdfActions(
    certificate: Certificate,
    pdf: CertificatePdf,
    onCheckAgain: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    val external = rememberExternalActions()
    val context = LocalContext.current
    val subject = stringResource(R.string.certificates_share_subject, certificateTypeLabel(certificate.type), certificate.studentName)
    when (pdf) {
        CertificatePdf.Preparing -> SecondaryButton(
            text = stringResource(R.string.certificates_pdf_preparing),
            onClick = {},
            loading = true,
            enabled = false,
            modifier = modifier.fillMaxWidth().padding(top = 8.dp),
        )
        is CertificatePdf.Ready -> Row(
            modifier.fillMaxWidth().padding(top = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            SecondaryButton(
                text = stringResource(R.string.certificates_open_pdf),
                onClick = { external.open(pdf.url) },
                leadingIcon = Icons.Outlined.Download,
                modifier = Modifier.weight(1f),
            )
            SecondaryButton(
                text = stringResource(R.string.certificates_share),
                onClick = { shareLink(context, pdf.url, subject) },
                leadingIcon = Icons.Outlined.Share,
                modifier = Modifier.weight(1f),
            )
        }
        CertificatePdf.Pending, CertificatePdf.Failed -> {
            val text = if (pdf == CertificatePdf.Failed) R.string.certificates_pdf_failed else R.string.certificates_pdf_pending
            InlineMessage(stringResource(text), StatusTone.Info, modifier.padding(top = 8.dp))
            if (onCheckAgain != null) {
                SecondaryButton(
                    text = stringResource(R.string.certificates_pdf_check),
                    onClick = onCheckAgain,
                    leadingIcon = Icons.Outlined.Refresh,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                )
            }
        }
    }
}

/** System share sheet with the PDF link (WhatsApp, email, ...). */
internal fun shareLink(context: Context, url: String, subject: String) {
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, subject)
        putExtra(Intent.EXTRA_TEXT, "$subject\n$url")
    }
    try {
        context.startActivity(Intent.createChooser(send, subject).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: ActivityNotFoundException) {
        // Nothing on the device can share text.
    }
}
