package com.schoolapp.feature.fees.staff.proofs.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AttachmentChipItem
import com.schoolapp.core.designsystem.component.AttachmentChips
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.label
import com.schoolapp.feature.fees.components.tone
import com.schoolapp.feature.fees.staff.proofs.ProofDecision
import com.schoolapp.feature.fees.staff.proofs.ProofReview

/** Proof details with the file; verify (optional note) or reject (reason required) when allowed. */
@Composable
internal fun ProofReviewSheet(
    review: ProofReview,
    currency: String,
    canApprove: Boolean,
    onOpenFile: (String) -> Unit,
    onChoose: (ProofDecision?) -> Unit,
    onTextChange: (String) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    val proof = review.proof
    AppBottomSheet(title = stringResource(R.string.fees_proof_title), onDismiss = onDismiss) {
        StatusChip(proof.status.label(), proof.status.tone())
        MoneyRow(stringResource(R.string.fees_amount_paid), proof.amountMinor, currency = currency, emphasized = true)
        KeyValueRow(stringResource(R.string.fees_student), proof.studentName)
        KeyValueRow(stringResource(R.string.fees_invoice), proof.invoiceNo)
        KeyValueRow(stringResource(R.string.fees_method), proof.method.label())
        KeyValueRow(stringResource(R.string.fees_reference), proof.reference)
        KeyValueRow(stringResource(R.string.fees_paid_on), formatDate(proof.paidOn))
        KeyValueRow(stringResource(R.string.fees_submitted_by), proof.submittedBy)
        KeyValueRow(stringResource(R.string.fees_submitted_at), formatTimestamp(proof.createdAt))
        if (proof.status == ProofStatus.REJECTED) proof.reason?.let { KeyValueRow(stringResource(R.string.fees_reject_reason), it) }
        proof.note?.let { KeyValueRow(stringResource(R.string.fees_proof_note_label), it) }
        val fileUrl = proof.fileUrl
        if (fileUrl != null) {
            AttachmentChips(
                items = listOf(AttachmentChipItem(proof.id, stringResource(R.string.fees_proof_file), proof.fileMime?.startsWith("image/") == true, fileUrl)),
                onOpen = { onOpenFile(fileUrl) },
            )
        } else {
            Text(stringResource(R.string.fees_proof_file_unavailable), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        if (!canApprove) {
            InlineMessage(stringResource(R.string.fees_proof_no_permission), StatusTone.Info)
            return@AppBottomSheet
        }
        review.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        when (review.decision) {
            null -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SecondaryButton(stringResource(R.string.fees_reject), { onChoose(ProofDecision.REJECT) }, Modifier.weight(1f), contentColor = AppColors.Error)
                PrimaryButton(stringResource(R.string.fees_verify), { onChoose(ProofDecision.VERIFY) }, Modifier.weight(1f))
            }
            ProofDecision.VERIFY -> {
                Text(stringResource(R.string.fees_verify_help), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                AppTextArea(review.text, onTextChange, stringResource(R.string.fees_note_optional), enabled = !review.isSaving)
                PrimaryButton(stringResource(R.string.fees_verify), onConfirm, Modifier.fillMaxWidth(), loading = review.isSaving)
                AppTextButton(stringResource(R.string.fees_back), { onChoose(null) }, enabled = !review.isSaving)
            }
            ProofDecision.REJECT -> {
                AppTextArea(
                    value = review.text,
                    onValueChange = onTextChange,
                    label = stringResource(R.string.fees_reject_reason),
                    errorText = if (review.textMissing) stringResource(R.string.fees_required) else null,
                    enabled = !review.isSaving,
                )
                PrimaryButton(stringResource(R.string.fees_reject), onConfirm, Modifier.fillMaxWidth(), loading = review.isSaving)
                AppTextButton(stringResource(R.string.fees_back), { onChoose(null) }, enabled = !review.isSaving)
            }
        }
    }
}
