package com.schoolapp.feature.certificates.review

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardMembership
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.components.CertificateCard
import com.schoolapp.feature.certificates.components.certificateStatusLabel
import com.schoolapp.feature.certificates.review.components.ReviewCardFooter

internal class ReviewActionsCallbacks(
    val onFilterChange: (ReviewFilter) -> Unit,
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
    val onApprove: (String) -> Unit,
    val onReject: (String) -> Unit,
    val onIssue: (String) -> Unit,
    val onReissue: (String) -> Unit,
    val onCheckPdf: (String) -> Unit,
)

@Composable
internal fun CertificateReviewScreen(state: CertificateReviewUiState, actions: ReviewActionsCallbacks, modifier: Modifier = Modifier) {
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
            item(key = "filters") {
                FilterChipRow(
                    options = ReviewFilter.entries.map { SwitcherOption(it.name, filterLabel(it)) },
                    selectedId = state.filter.name,
                    onSelect = { actions.onFilterChange(ReviewFilter.valueOf(it)) },
                )
            }
            state.message?.let { message -> item(key = "message") { InlineMessage(stringResource(messageText(message)), StatusTone.Success) } }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry) }
                state.certificates.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.certificates_empty),
                        message = stringResource(R.string.certificates_empty_review_message),
                        icon = Icons.Outlined.CardMembership,
                    )
                }
                else -> items(state.certificates, key = { it.id }) { certificate -> ReviewCard(certificate, state, actions) }
            }
        }
    }
}

@Composable
private fun ReviewCard(certificate: Certificate, state: CertificateReviewUiState, actions: ReviewActionsCallbacks) {
    CertificateCard(certificate, showStudent = true) {
        state.actionError?.takeIf { it.first == certificate.id }?.let { (_, error) ->
            InlineMessage(appErrorMessage(error), StatusTone.Error, Modifier.padding(top = 8.dp))
        }
        ReviewCardFooter(certificate, state, actions)
    }
}

private fun messageText(message: ReviewMessage): Int = when (message) {
    ReviewMessage.APPROVED -> R.string.certificates_approved_message
    ReviewMessage.REJECTED -> R.string.certificates_rejected_message
    ReviewMessage.ISSUED -> R.string.certificates_issued_message
    ReviewMessage.REISSUED -> R.string.certificates_reissued_message
    ReviewMessage.REQUESTED -> R.string.certificates_staff_requested_message
}

@Composable
private fun filterLabel(filter: ReviewFilter): String =
    filter.status?.let { certificateStatusLabel(it) } ?: stringResource(R.string.certificates_filter_all)
