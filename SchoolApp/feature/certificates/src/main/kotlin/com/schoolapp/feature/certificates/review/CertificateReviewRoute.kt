package com.schoolapp.feature.certificates.review

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.PostAdd
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.review.components.IssueCertificateSheet
import com.schoolapp.feature.certificates.review.components.RejectCertificateSheet
import com.schoolapp.feature.certificates.review.components.ReissueCertificateSheet
import com.schoolapp.feature.certificates.review.request.StaffRequestCallbacks
import com.schoolapp.feature.certificates.review.request.StaffRequestSheet

@Composable
internal fun CertificateReviewRoute(modifier: Modifier = Modifier, viewModel: CertificateReviewViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val issuing = viewModel.issuing
    val requests = viewModel.requests
    Box(modifier.fillMaxSize()) {
        CertificateReviewScreen(
            state = state,
            actions = ReviewActionsCallbacks(
                onFilterChange = viewModel::onFilterChange,
                onRefresh = viewModel::refresh,
                onRetry = viewModel::retry,
                onApprove = viewModel::approve,
                onReject = viewModel::openReject,
                onIssue = issuing::openIssue,
                onReissue = issuing::openReissue,
                onCheckPdf = issuing::checkPdf,
            ),
        )
        if (state.canIssue) {
            Box(Modifier.align(Alignment.BottomEnd).padding(16.dp)) {
                AppFloatingButton(stringResource(R.string.certificates_new_request), Icons.Outlined.PostAdd, requests::open)
            }
        }
    }
    state.rejectForm?.let { form ->
        RejectCertificateSheet(
            form = form,
            onReasonChange = viewModel::onRejectReasonChange,
            onSubmit = viewModel::submitReject,
            onDismiss = viewModel::dismissReject,
        )
    }
    state.issueForm?.let { form ->
        IssueCertificateSheet(form, issuing::onEffectiveDate, issuing::submitIssue, issuing::dismissIssue)
    }
    state.reissueForm?.let { form ->
        ReissueCertificateSheet(form, issuing::onReissueReason, issuing::submitReissue, issuing::dismissReissue)
    }
    state.requestForm?.let { form ->
        StaffRequestSheet(
            form = form,
            callbacks = StaffRequestCallbacks(
                onQueryChange = requests::onQueryChange,
                onPick = requests::onPick,
                onClearStudent = requests::clearStudent,
                onTypeChange = requests::onTypeChange,
                onPurposeChange = requests::onPurposeChange,
                onAchievementChange = requests::onAchievementChange,
                onSubmit = requests::submit,
                onDismiss = requests::dismiss,
            ),
        )
    }
}
