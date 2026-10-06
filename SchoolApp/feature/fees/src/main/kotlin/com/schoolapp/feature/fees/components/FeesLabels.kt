package com.schoolapp.feature.fees.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.fees.InvoiceStatus
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.ProofMethod
import com.schoolapp.core.model.fees.ProofStatus
import com.schoolapp.feature.fees.R

internal fun InvoiceStatus.tone(): StatusTone = when (this) {
    InvoiceStatus.PAID -> StatusTone.Success
    InvoiceStatus.PARTIALLY_PAID -> StatusTone.Warning
    InvoiceStatus.OVERDUE -> StatusTone.Error
    InvoiceStatus.ISSUED -> StatusTone.Info
    InvoiceStatus.DRAFT, InvoiceStatus.CANCELLED -> StatusTone.Neutral
}

@Composable
@ReadOnlyComposable
internal fun InvoiceStatus.label(): String = stringResource(
    when (this) {
        InvoiceStatus.DRAFT -> R.string.fees_status_draft
        InvoiceStatus.ISSUED -> R.string.fees_status_issued
        InvoiceStatus.PARTIALLY_PAID -> R.string.fees_status_partially_paid
        InvoiceStatus.PAID -> R.string.fees_status_paid
        InvoiceStatus.OVERDUE -> R.string.fees_status_overdue
        InvoiceStatus.CANCELLED -> R.string.fees_status_cancelled
    },
)

@Composable
@ReadOnlyComposable
internal fun PaymentMethod.label(): String = stringResource(
    when (this) {
        PaymentMethod.CASH -> R.string.fees_method_cash
        PaymentMethod.BANK -> R.string.fees_method_bank
        PaymentMethod.CHEQUE -> R.string.fees_method_cheque
        PaymentMethod.ONLINE -> R.string.fees_method_online
    },
)

@Composable
@ReadOnlyComposable
internal fun ProofMethod.label(): String = stringResource(
    when (this) {
        ProofMethod.BANK -> R.string.fees_method_bank
        ProofMethod.WALLET -> R.string.fees_method_wallet
        ProofMethod.OTHER -> R.string.fees_method_other
    },
)

internal fun ProofStatus.tone(): StatusTone = when (this) {
    ProofStatus.SUBMITTED -> StatusTone.Info
    ProofStatus.VERIFIED -> StatusTone.Success
    ProofStatus.REJECTED -> StatusTone.Error
}

@Composable
@ReadOnlyComposable
internal fun ProofStatus.label(): String = stringResource(
    when (this) {
        ProofStatus.SUBMITTED -> R.string.fees_proof_status_submitted
        ProofStatus.VERIFIED -> R.string.fees_proof_status_verified
        ProofStatus.REJECTED -> R.string.fees_proof_status_rejected
    },
)
