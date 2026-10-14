package com.schoolapp.feature.certificates.parent

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardMembership
import androidx.compose.material.icons.outlined.FamilyRestroom
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
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.components.CertificateCard
import com.schoolapp.feature.certificates.components.CertificatePdfActions
import com.schoolapp.feature.certificates.components.pdfOf

/**
 * Parent certificates for the active child. [onBack] non-null = pushed screen with its own top bar
 * (parent shortcut); null = inside the shell's menu.
 */
@Composable
internal fun ParentCertificatesRoute(
    modifier: Modifier = Modifier,
    onBack: (() -> Unit)? = null,
    viewModel: ParentCertificatesViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val fab: @Composable () -> Unit = {
        if (state.canRequest && state.childId != null) {
            AppFloatingButton(stringResource(R.string.certificates_request), Icons.Outlined.PostAdd, viewModel::openForm)
        }
    }
    if (onBack != null) {
        AppScaffold(
            modifier = modifier,
            topBar = {
                AppTopBar(
                    title = stringResource(R.string.certificates_title),
                    subtitle = state.childName,
                    navigationIcon = { BackButton(onBack) },
                )
            },
            floatingActionButton = fab,
        ) { padding ->
            ParentCertificatesScreen(state, onRetry = viewModel::retry, modifier = Modifier.padding(padding))
        }
    } else {
        Box(modifier.fillMaxSize()) {
            ParentCertificatesScreen(state, onRetry = viewModel::retry)
            Box(Modifier.align(Alignment.BottomEnd).padding(16.dp)) { fab() }
        }
    }
    state.form?.let { form ->
        RequestCertificateSheet(
            form = form,
            childName = state.childName,
            onTypeChange = viewModel::onTypeChange,
            onPurposeChange = viewModel::onPurposeChange,
            onAchievementChange = viewModel::onAchievementChange,
            onSubmit = viewModel::submit,
            onDismiss = viewModel::dismissForm,
        )
    }
}

@Composable
internal fun ParentCertificatesScreen(
    state: ParentCertificatesUiState,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        state.childId == null && !state.isLoading -> EmptyState(
            title = stringResource(R.string.certificates_no_child),
            message = stringResource(R.string.certificates_no_child_message),
            modifier = modifier,
            icon = Icons.Outlined.FamilyRestroom,
        )
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
            if (state.requested) {
                item(key = "requested") { InlineMessage(stringResource(R.string.certificates_requested_message), StatusTone.Success) }
            }
            if (state.certificates.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.certificates_empty),
                        message = stringResource(R.string.certificates_empty_parent_message, state.childName.orEmpty()),
                        icon = Icons.Outlined.CardMembership,
                    )
                }
            }
            items(state.certificates, key = { it.id }) { certificate ->
                CertificateCard(certificate) {
                    if (certificate.status == CertificateStatus.ISSUED) {
                        CertificatePdfActions(certificate, pdfOf(certificate, null), onCheckAgain = onRetry)
                    }
                }
            }
        }
    }
}
