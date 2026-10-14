package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.UploadFile
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.ApplicationDocument
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.admissions.R

/** Documents on the application: open, upload (before a decision), verify or reject pending ones. */
@Composable
internal fun ApplicationDocumentsCard(
    documents: List<ApplicationDocument>,
    canUpload: Boolean,
    canVerify: Boolean,
    onOpen: (DetailSheet) -> Unit,
    modifier: Modifier = Modifier,
) {
    val external = rememberExternalActions()
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.admissions_documents),
            action = if (canUpload) {
                { AppTextButton(stringResource(R.string.admissions_upload), { onOpen(DetailSheet.Upload) }, leadingIcon = Icons.Outlined.UploadFile) }
            } else {
                null
            },
        )
        if (documents.isEmpty()) {
            val empty = if (canUpload) R.string.admissions_documents_empty_upload else R.string.admissions_documents_empty
            Text(stringResource(empty), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        documents.forEach { doc ->
            ListItemRow(
                title = docTypeLabel(doc.docType),
                supporting = doc.note,
                leadingIcon = Icons.Outlined.Description,
                onClick = doc.url?.let { url -> { external.open(url) } },
                trailing = doc.status?.let { status -> { StatusChip(humanizeKey(status), statusTone(status)) } },
            )
            if (canVerify && doc.status == PENDING) {
                Row {
                    AppTextButton(stringResource(R.string.admissions_verify), { onOpen(DetailSheet.Verify(doc)) })
                    AppTextButton(stringResource(R.string.admissions_reject), { onOpen(DetailSheet.Reject(doc)) }, contentColor = AppColors.Error)
                }
            }
        }
    }
}

/** Same labels as the web ("B-Form", "CNIC", otherwise humanized). */
@Composable
internal fun docTypeLabel(type: String): String = when (type) {
    "B_FORM" -> stringResource(R.string.admissions_doc_b_form)
    "CNIC" -> stringResource(R.string.admissions_doc_cnic)
    else -> humanizeKey(type)
}

internal val DOC_TYPES = listOf("BIRTH_CERTIFICATE", "B_FORM", "CNIC", "PHOTO", "PREVIOUS_RESULT", "LEAVING_CERTIFICATE", "MEDICAL", "OTHER")

private const val PENDING = "UPLOADED"
