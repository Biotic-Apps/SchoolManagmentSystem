package com.schoolapp.feature.pickup.persons

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.DirectionsWalk
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.schoolapp.core.common.result.AppError
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.pickup.R
import com.schoolapp.feature.pickup.components.studentSearchItems

/** Branch "Authorised persons" tab (web AuthorizedPersonsTab). */
@Composable
internal fun AuthorisedPersonsTab(modifier: Modifier = Modifier, viewModel: AuthorisedPersonsViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var failure by remember { mutableStateOf<AppError?>(null) }
    LaunchedEffect(viewModel) {
        viewModel.events.collect { event ->
            when (event) {
                is PersonsEvent.Done -> snackbar.showSnackbar(
                    context.getString(if (event.action == PersonAction.VERIFY) R.string.pickup_person_verified else R.string.pickup_person_revoked),
                )
                is PersonsEvent.Failed -> failure = event.error
            }
        }
    }
    failure?.let { current ->
        val message = actionErrorMessage(current)
        LaunchedEffect(current) {
            failure = null
            snackbar.showSnackbar(message)
        }
    }
    val error = state.error
    val student = state.student
    val searchHint = stringResource(R.string.pickup_persons_search_hint)
    Box(modifier.fillMaxSize()) {
        RefreshBox(isRefreshing = state.isRefreshing, onRefresh = { viewModel.load() }) {
            ScreenColumn(itemSpacing = 12.dp) {
                if (student == null) {
                    studentSearchItems(
                        state = state.search,
                        onQueryChange = viewModel::onQueryChange,
                        onPick = viewModel::onStudentPicked,
                        hint = searchHint,
                    )
                    return@ScreenColumn
                }
                item(key = "student") { SelectedStudentCard(student, onChange = viewModel::onClearStudent) }
                item(key = "hint") {
                    Text(stringResource(R.string.pickup_persons_rule), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
                when {
                    state.isLoading -> item(key = "loading") { LoadingState() }
                    error != null -> item(key = "error") { ErrorState(loadErrorMessage(error), onRetry = { viewModel.load(refresh = false) }) }
                    state.persons.isEmpty() -> item(key = "empty") {
                        EmptyState(stringResource(R.string.pickup_persons_none), icon = Icons.AutoMirrored.Outlined.DirectionsWalk)
                    }
                    else -> items(state.persons.size, key = { state.persons[it].id }) { index ->
                        val person = state.persons[index]
                        AuthorisedPersonCard(person, if (state.canManage) ({ action -> viewModel.ask(person, action) }) else null)
                    }
                }
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
    state.confirm?.let { confirm ->
        val verify = confirm.action == PersonAction.VERIFY
        ConfirmDialog(
            title = stringResource(if (verify) R.string.pickup_verify_title else R.string.pickup_revoke_title),
            message = stringResource(if (verify) R.string.pickup_verify_message else R.string.pickup_revoke_message, confirm.person.name),
            confirmLabel = stringResource(if (verify) R.string.pickup_verify else R.string.pickup_revoke),
            onConfirm = viewModel::confirm,
            onDismiss = viewModel::dismiss,
            destructive = !verify,
        )
    }
}
