package com.schoolapp.feature.staff.add

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R

/** What happens after the staff record exists: assign classes, or open the profile. */
data class AddStaffDone(val staffId: String, val staffName: String, val branchId: String, val assignClasses: Boolean)

@Composable
fun AddStaffRoute(
    onBack: () -> Unit,
    onDone: (AddStaffDone) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AddStaffViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val created = state.created
    val finish = {
        if (created != null) {
            onDone(AddStaffDone(created.staff.summary.id, created.staff.summary.name, state.branchId.orEmpty(), state.offerAssign))
        }
    }
    // The password is shown once: leaving this screen continues the flow instead of returning to the form.
    BackHandler(enabled = created != null, onBack = finish)
    LaunchedEffect(created) {
        if (created != null && !state.showCredentials) finish()
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(if (created == null) R.string.staff_add_title else R.string.staff_added_title),
                navigationIcon = { BackButton(if (created == null) onBack else finish) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            !state.canAdd -> EmptyState(stringResource(R.string.staff_no_permission), body, icon = Icons.Outlined.Lock)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            created != null && state.showCredentials -> CredentialsContent(
                created = created,
                continueLabel = stringResource(if (state.offerAssign) R.string.staff_next_assign else R.string.staff_open_profile),
                onContinue = finish,
                modifier = body,
            )
            else -> AddStaffForm(
                state = state,
                onFormChange = viewModel::onFormChange,
                onBranchChange = viewModel::onBranchChange,
                onCreateAccountChange = viewModel::onCreateAccountChange,
                onRoleChange = viewModel::onRoleChange,
                onSubmit = viewModel::submit,
                modifier = body,
            )
        }
    }
}
