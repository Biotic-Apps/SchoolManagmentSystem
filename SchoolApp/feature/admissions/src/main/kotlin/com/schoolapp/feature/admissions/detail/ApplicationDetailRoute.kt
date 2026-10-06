package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admissions.R

@Composable
fun ApplicationDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ApplicationDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.admissions_detail_title), navigationIcon = { BackButton(onBack) }) },
        bottomBar = { if (state.showActions) DecisionBar(onDecide = viewModel::onDecisionRequested) },
    ) { padding ->
        val body = Modifier.padding(padding)
        val app = state.application
        when {
            app == null && state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            app == null -> LoadingState(body)
            else -> ScreenColumn(body) {
                if (state.decided) item(key = "decided") { InlineMessage(stringResource(R.string.admissions_decided), StatusTone.Success) }
                state.decideError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "summary") { ApplicationSummaryCard(app) }
                item(key = "guardians") { ApplicantGuardiansCard(app.guardians) }
                app.test?.let { test -> item(key = "test") { AdmissionTestCard(test) } }
            }
        }
    }
    state.pendingDecision?.let { decision ->
        DecisionDialog(
            decision = decision,
            reason = state.reason,
            reasonMissing = state.reasonMissing,
            busy = state.isDeciding,
            onReasonChange = viewModel::onReasonChange,
            onConfirm = viewModel::confirmDecision,
            onDismiss = viewModel::onDecisionDismissed,
        )
    }
}

@Composable
private fun DecisionBar(onDecide: (AdmissionDecision) -> Unit) {
    Surface(color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Row(Modifier.navigationBarsPadding().padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                AppTextButton(stringResource(R.string.admissions_reject), { onDecide(AdmissionDecision.REJECT) }, contentColor = AppColors.Error)
                SecondaryButton(stringResource(R.string.admissions_waitlist), { onDecide(AdmissionDecision.WAITLIST) }, Modifier.weight(1f))
                PrimaryButton(stringResource(R.string.admissions_offer), { onDecide(AdmissionDecision.OFFER) }, Modifier.weight(1f))
            }
        }
    }
}
