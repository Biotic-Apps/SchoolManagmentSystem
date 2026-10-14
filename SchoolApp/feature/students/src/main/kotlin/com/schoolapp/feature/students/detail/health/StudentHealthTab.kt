package com.schoolapp.feature.students.detail.health

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.MonitorHeart
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R

/** Health tab (web HealthTab); [canEdit] = `health.edit` opens the full profile editor. */
@Composable
internal fun StudentHealthTab(studentId: String, canEdit: Boolean, snackbar: SnackbarHostState, modifier: Modifier = Modifier) {
    val viewModel: StudentHealthViewModel = hiltViewModel()
    LaunchedEffect(studentId) { viewModel.start(studentId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val savedText = stringResource(R.string.sd_health_saved)
    LaunchedEffect(viewModel) { viewModel.saved.collect { snackbar.showSnackbar(savedText) } }
    val error = state.error
    val profile = state.profile
    when {
        state.isLoading -> LoadingState(modifier)
        error != null && profile == null -> ErrorState(loadErrorMessage(error), modifier, onRetry = { viewModel.load() })
        else -> RefreshBox(state.isRefreshing, { viewModel.load(refresh = true) }, modifier.fillMaxSize()) {
            if (!state.hasProfile && state.incidents.isEmpty()) {
                PullableState {
                    EmptyState(
                        title = stringResource(R.string.sd_health_empty_title),
                        message = stringResource(R.string.sd_health_empty_message),
                        icon = Icons.Outlined.MonitorHeart,
                        action = if (canEdit) ({ EditButton(viewModel::openEditor) }) else null,
                    )
                }
            } else {
                ScreenColumn {
                    item(key = "head") {
                        val updated = profile?.updatedAt?.let(::formatTimestamp)
                        Text(
                            if (updated != null) stringResource(R.string.sd_health_updated, updated) else stringResource(R.string.sd_health_not_updated),
                            style = MaterialTheme.typography.bodySmall,
                            color = AppColors.TextSecondary,
                        )
                    }
                    if (canEdit) item(key = "edit") { EditButton(viewModel::openEditor, Modifier.fillMaxWidth()) }
                    if (profile != null && state.hasProfile) healthProfileItems(profile, external::dial)
                    item(key = "incidents") { StudentIncidentsCard(state.incidents) }
                }
            }
        }
    }
    state.draft?.takeIf { canEdit }?.let { draft ->
        HealthEditorSheet(draft, viewModel::onDraftChange, viewModel::save, viewModel::closeEditor)
    }
}

@Composable
private fun EditButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    SecondaryButton(stringResource(R.string.sd_health_edit), onClick, modifier, leadingIcon = Icons.Outlined.EditNote)
}
