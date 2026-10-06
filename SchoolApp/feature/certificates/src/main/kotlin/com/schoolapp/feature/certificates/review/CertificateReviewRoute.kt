package com.schoolapp.feature.certificates.review

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardMembership
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.padding
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.components.CertificateCard
import com.schoolapp.feature.certificates.components.certificateStatusLabel
import com.schoolapp.feature.certificates.review.components.ClearanceBlockedMessage
import com.schoolapp.feature.certificates.review.components.RejectCertificateSheet
import com.schoolapp.feature.certificates.review.components.ReviewActions

@Composable
internal fun CertificateReviewRoute(modifier: Modifier = Modifier, viewModel: CertificateReviewViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    CertificateReviewScreen(
        state = state,
        onFilterChange = viewModel::onFilterChange,
        onApprove = viewModel::approve,
        onReject = viewModel::openReject,
        onRetry = viewModel::retry,
        modifier = modifier,
    )
    state.rejectForm?.let { form ->
        RejectCertificateSheet(
            form = form,
            onReasonChange = viewModel::onRejectReasonChange,
            onSubmit = viewModel::submitReject,
            onDismiss = viewModel::dismissReject,
        )
    }
}

@Composable
internal fun CertificateReviewScreen(
    state: CertificateReviewUiState,
    onFilterChange: (ReviewFilter) -> Unit,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenColumn(modifier) {
        item(key = "filters") {
            FilterChipRow(
                options = ReviewFilter.entries.map { SwitcherOption(it.name, filterLabel(it)) },
                selectedId = state.filter.name,
                onSelect = { onFilterChange(ReviewFilter.valueOf(it)) },
            )
        }
        item(key = "web_note") { InlineMessage(stringResource(R.string.certificates_issue_on_web), StatusTone.Info) }
        state.message?.let { message ->
            item(key = "message") {
                val text = when (message) {
                    ReviewMessage.APPROVED -> R.string.certificates_approved_message
                    ReviewMessage.REJECTED -> R.string.certificates_rejected_message
                }
                InlineMessage(stringResource(text), StatusTone.Success)
            }
        }
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            state.certificates.isEmpty() -> item(key = "empty") {
                EmptyState(
                    title = stringResource(R.string.certificates_empty),
                    message = stringResource(R.string.certificates_empty_review_message),
                    icon = Icons.Outlined.CardMembership,
                )
            }
            else -> items(state.certificates, key = { it.id }) { certificate ->
                CertificateCard(certificate, showStudent = true) {
                    state.blocked[certificate.id]?.let { ClearanceBlockedMessage(it, Modifier.padding(top = 8.dp)) }
                    state.actionError?.takeIf { it.first == certificate.id }?.let { (_, error) ->
                        InlineMessage(appErrorMessage(error), StatusTone.Error, Modifier.padding(top = 8.dp))
                    }
                    if (state.canApprove && certificate.status == CertificateStatus.REQUESTED) {
                        ReviewActions(
                            busy = certificate.id in state.busyIds,
                            onApprove = { onApprove(certificate.id) },
                            onReject = { onReject(certificate.id) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun filterLabel(filter: ReviewFilter): String =
    filter.status?.let { certificateStatusLabel(it) } ?: stringResource(R.string.certificates_filter_all)
