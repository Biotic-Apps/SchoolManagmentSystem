package com.schoolapp.feature.fees.staff.proofs

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.FactCheck
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.staff.proofs.components.ProofReviewSheet
import com.schoolapp.feature.fees.staff.proofs.components.ProofRow

internal data class ProofsActions(
    val onRetry: () -> Unit,
    val onRefresh: () -> Unit,
    val onOpen: (PaymentProof) -> Unit,
    val onOpenFile: (String) -> Unit,
    val onChoose: (ProofDecision?) -> Unit,
    val onTextChange: (String) -> Unit,
    val onConfirm: () -> Unit,
    val onDismiss: () -> Unit,
)

@Composable
internal fun ProofsTab(state: ProofsUiState, actions: ProofsActions, modifier: Modifier = Modifier) {
    val currency = MoneyFormat.DEFAULT_CURRENCY
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null && state.proofs.isEmpty() -> ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry)
            else -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                state.lastDecision?.let { decision ->
                    item(key = "decided") {
                        val text = if (decision == ProofDecision.VERIFY) R.string.fees_proof_verified_message else R.string.fees_proof_rejected_message
                        InlineMessage(stringResource(text), StatusTone.Success)
                    }
                }
                if (state.proofs.isEmpty()) {
                    item(key = "empty") {
                        EmptyState(
                            title = stringResource(R.string.fees_no_proofs),
                            message = stringResource(R.string.fees_no_proofs_message),
                            icon = Icons.AutoMirrored.Outlined.FactCheck,
                        )
                    }
                }
                items(state.proofs, key = { "proof_${it.id}" }) { proof -> ProofRow(proof, currency, onClick = { actions.onOpen(proof) }) }
            }
        }
    }
    state.review?.let { review ->
        ProofReviewSheet(
            review = review,
            currency = currency,
            canApprove = state.canApprove,
            onOpenFile = actions.onOpenFile,
            onChoose = actions.onChoose,
            onTextChange = actions.onTextChange,
            onConfirm = actions.onConfirm,
            onDismiss = actions.onDismiss,
        )
    }
}
