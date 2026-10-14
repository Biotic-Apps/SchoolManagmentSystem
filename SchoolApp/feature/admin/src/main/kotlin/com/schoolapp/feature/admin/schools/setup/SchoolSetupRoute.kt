package com.schoolapp.feature.admin.schools.setup

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.components.StepIndicator
import com.schoolapp.feature.admin.schools.setup.components.WizardFooter
import com.schoolapp.feature.admin.schools.setup.steps.SetupSuccess

/** "New school": six steps, then the success screen with the principal's sign-in. */
@Composable
internal fun SchoolSetupRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SetupViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var confirmDiscard by rememberSaveable { mutableStateOf(false) }
    val result = state.result
    val leave: () -> Unit = {
        when {
            result != null -> onBack()
            state.isDirty -> confirmDiscard = true
            else -> onBack()
        }
    }
    // Back walks the steps first; on the first step it leaves (asking when something was entered).
    BackHandler(enabled = result == null && !state.isSubmitting) {
        if (state.step.ordinal > 0) viewModel.back() else leave()
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(if (result == null) R.string.setup_title else R.string.setup_created_title),
                subtitle = if (result == null) stringResource(state.step.title) else null,
                navigationIcon = { BackButton(leave) },
            )
        },
        bottomBar = {
            if (result == null && state.canSetup) {
                WizardFooter(state, onBack = viewModel::back, onNext = viewModel::next)
            }
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            result != null -> SetupSuccess(result, onDone = onBack, modifier = body)
            !state.canSetup -> EmptyState(stringResource(R.string.setup_no_permission), body, icon = Icons.Outlined.Lock)
            else -> Column(body) {
                StepIndicator(state.step, state.reached, onSelect = viewModel::goTo)
                SetupStepContent(state, viewModel.edits, onEditStep = viewModel::goTo)
            }
        }
    }
    if (confirmDiscard) {
        ConfirmDialog(
            title = stringResource(R.string.setup_discard_title),
            message = stringResource(R.string.setup_discard_message),
            confirmLabel = stringResource(R.string.admin_discard),
            onConfirm = {
                confirmDiscard = false
                onBack()
            },
            onDismiss = { confirmDiscard = false },
            destructive = true,
        )
    }
}
