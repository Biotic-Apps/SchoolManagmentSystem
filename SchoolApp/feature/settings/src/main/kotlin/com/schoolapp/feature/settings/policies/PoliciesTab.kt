package com.schoolapp.feature.settings.policies

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import com.schoolapp.feature.settings.components.ReadOnlyNotice
import com.schoolapp.feature.settings.components.SettingsFormActions

/** Settings › Policies: password and sign-in security plus school-wide defaults (branches may override). */
@Composable
internal fun PoliciesTab(schoolId: String, canEdit: Boolean, modifier: Modifier = Modifier) {
    val viewModel: PoliciesViewModel = hiltViewModel(key = "policies_$schoolId")
    LaunchedEffect(schoolId) { viewModel.bind(schoolId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    when {
        state.isLoading -> LoadingState(modifier)
        state.settings == null -> ErrorState(
            message = state.error?.let { loadErrorMessage(it) } ?: stringResource(R.string.settings_policies_load_failed),
            modifier = modifier,
            onRetry = viewModel::retry,
        )
        else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
            ScreenColumn {
                item(key = "form") {
                    AppCard(verticalSpacing = 20.dp, animateSize = false) {
                        if (!canEdit) ReadOnlyNotice()
                        state.saveError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
                        if (state.saved && !state.dirty) InlineMessage(stringResource(R.string.settings_policies_saved), StatusTone.Success)
                        val errors = PolicyErrors(state)
                        SecuritySection(state.form, canEdit, errors, viewModel::edit)
                        DefaultsSection(state.form, canEdit, errors, viewModel::edit)
                        if (canEdit) SettingsFormActions(state.dirty, state.saving, viewModel::save, viewModel::discard)
                    }
                }
            }
        }
    }
}

/** Field error lookup: our own checks (after a save attempt) first, then the server's. */
internal class PolicyErrors(private val state: PoliciesUiState) {
    fun problem(key: String): PolicyProblem? = state.problems[key]?.takeIf { state.showProblems }

    fun server(key: String): String? = state.serverErrors[key]
}
