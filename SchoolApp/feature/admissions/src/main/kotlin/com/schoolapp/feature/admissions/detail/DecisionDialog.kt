package com.schoolapp.feature.admissions.detail

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.feature.admissions.R

/** Offer, waitlist or reject; the reason is required only to reject and is shared with the guardian. */
@Composable
internal fun DecisionDialog(
    decision: AdmissionDecision,
    busy: Boolean,
    error: AppError?,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    ReasonDialog(
        title = stringResource(decision.titleRes()),
        message = stringResource(
            if (decision == AdmissionDecision.WAITLIST) R.string.admissions_decide_waitlist_hint else R.string.admissions_decide_hint,
        ),
        confirmLabel = stringResource(decision.labelRes()),
        busy = busy,
        error = error,
        required = decision == AdmissionDecision.REJECT,
        destructive = decision == AdmissionDecision.REJECT,
        onConfirm = onConfirm,
        onDismiss = onDismiss,
    )
}

internal fun AdmissionDecision.labelRes(): Int = when (this) {
    AdmissionDecision.OFFER -> R.string.admissions_offer
    AdmissionDecision.WAITLIST -> R.string.admissions_waitlist
    AdmissionDecision.REJECT -> R.string.admissions_reject
}

private fun AdmissionDecision.titleRes(): Int = when (this) {
    AdmissionDecision.OFFER -> R.string.admissions_confirm_title_offer
    AdmissionDecision.WAITLIST -> R.string.admissions_confirm_title_waitlist
    AdmissionDecision.REJECT -> R.string.admissions_confirm_title_reject
}
