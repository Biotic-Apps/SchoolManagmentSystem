package com.schoolapp.feature.staff.edit

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
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.FormMaxWidth
import com.schoolapp.feature.staff.form.StaffFormFields

@Composable
fun EditStaffRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: EditStaffViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.saved) { if (state.saved) onBack() }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.staff_edit_title),
                subtitle = state.name.ifBlank { null },
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            !state.canEdit -> EmptyState(stringResource(R.string.staff_no_permission), body, icon = Icons.Outlined.Lock)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            else -> ScreenColumn(body, maxWidth = FormMaxWidth) {
                state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
                item(key = "fields") {
                    StaffFormFields(
                        form = state.form,
                        errors = state.errors,
                        enabled = !state.isSaving,
                        onChange = viewModel::onFormChange,
                        cnicHint = state.cnicOnFile?.let { stringResource(R.string.staff_cnic_on_file, it) },
                    )
                }
                item(key = "save") { PrimaryButton(stringResource(R.string.staff_save), viewModel::save, loading = state.isSaving) }
            }
        }
    }
}
