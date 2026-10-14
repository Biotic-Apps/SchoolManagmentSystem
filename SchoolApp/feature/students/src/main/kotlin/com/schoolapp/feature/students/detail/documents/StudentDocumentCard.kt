package com.schoolapp.feature.students.detail.documents

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.HighlightOff
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.documents.SchoolDocument
import com.schoolapp.core.model.staff.documents.DocumentStatus
import com.schoolapp.feature.students.R

/** One document; tapping opens the file. Verify / reject only while it is pending (the API refuses otherwise). */
@Composable
internal fun StudentDocumentCard(
    document: SchoolDocument,
    canEdit: Boolean,
    onOpen: (String) -> Unit,
    onDecide: (DecisionKind) -> Unit,
    modifier: Modifier = Modifier,
) {
    val url = document.fileUrl
    AppCard(modifier.fillMaxWidth(), onClick = url?.let { { onOpen(it) } }, verticalSpacing = 8.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            val isImage = document.mime?.startsWith("image/") == true
            Icon(if (isImage) Icons.Outlined.Image else Icons.Outlined.Description, null, Modifier.size(24.dp), tint = AppColors.Primary)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(docTypeLabel(document.docType), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                if (url != null) Text(stringResource(R.string.sd_docs_open), style = MaterialTheme.typography.bodySmall, color = AppColors.Primary)
            }
            StatusChip(stringResource(document.status.labelRes()), document.status.tone())
        }
        document.note?.takeIf { it.isNotBlank() }?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        val checkedBy = document.verifiedByName
        val checkedAt = document.verifiedAt
        if (checkedBy != null && checkedAt != null) {
            Text(
                stringResource(R.string.sd_docs_checked_by, checkedBy, formatCheckedAt(checkedAt)),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        if (canEdit && document.status == DocumentStatus.UPLOADED) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AppTextButton(stringResource(R.string.sd_docs_verify), { onDecide(DecisionKind.VERIFY) }, leadingIcon = Icons.Outlined.CheckCircle)
                AppTextButton(
                    stringResource(R.string.sd_docs_reject),
                    { onDecide(DecisionKind.REJECT) },
                    leadingIcon = Icons.Outlined.HighlightOff,
                    contentColor = AppColors.Error,
                )
            }
        }
    }
}
