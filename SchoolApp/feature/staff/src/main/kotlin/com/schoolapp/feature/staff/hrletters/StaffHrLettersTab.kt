package com.schoolapp.feature.staff.hrletters

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.staff.R

/** Staff profile "HR Letters" tab (web HrLettersTab); [canGenerate] = session has `staff.edit`. */
@Composable
fun StaffHrLettersTab(canGenerate: Boolean, modifier: Modifier = Modifier) {
    val viewModel: HrLettersViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val external = rememberExternalActions()
    LaunchedEffect(state.openUrl) {
        state.openUrl?.let {
            external.open(it)
            viewModel.onUrlOpened()
        }
    }
    val generatedText = stringResource(R.string.staff_hr_generated)
    LaunchedEffect(state.generated) {
        if (!state.generated) return@LaunchedEffect
        viewModel.consumeGenerated()
        snackbar.showSnackbar(generatedText)
    }
    val actionMessage = state.actionError?.let { appErrorMessage(it) }
    LaunchedEffect(actionMessage) {
        actionMessage ?: return@LaunchedEffect
        viewModel.consumeActionError()
        snackbar.showSnackbar(actionMessage)
    }
    val canOpenForm = canGenerate && state.templates.isNotEmpty()
    Box(modifier.fillMaxSize()) {
        if (state.isLoading) {
            LoadingState(Modifier.fillMaxSize())
        } else {
            RefreshBox(state.isRefreshing, viewModel::refresh, Modifier.fillMaxSize()) {
                val error = state.error
                if (error != null) {
                    PullableState { ErrorState(loadErrorMessage(error), onRetry = viewModel::retry) }
                } else {
                    HrLettersList(state, canGenerate, canOpenForm, viewModel)
                }
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
    if (canGenerate) {
        state.form?.let { form ->
            GenerateLetterSheet(
                form = form,
                templates = state.templates,
                onTemplateChange = viewModel::onTemplateChange,
                onSubjectChange = viewModel::onSubjectChange,
                onEffectiveDateChange = viewModel::onEffectiveDateChange,
                onSubmit = viewModel::submit,
                onDismiss = viewModel::dismissForm,
            )
        }
    }
}

@Composable
private fun HrLettersList(state: HrLettersUiState, canGenerate: Boolean, canOpenForm: Boolean, viewModel: HrLettersViewModel) {
    val generateButton: (@Composable () -> Unit)? = if (canOpenForm) {
        { PrimaryButton(stringResource(R.string.staff_hr_generate), viewModel::openForm, leadingIcon = Icons.Outlined.Add) }
    } else {
        null
    }
    ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp), itemSpacing = 12.dp) {
        if (canGenerate && state.templates.isEmpty()) {
            item(key = "no-templates") { InlineMessage(stringResource(R.string.staff_hr_no_templates), StatusTone.Info) }
        }
        if (state.letters.isEmpty()) {
            item(key = "empty") {
                EmptyState(
                    title = stringResource(R.string.staff_hr_empty),
                    message = stringResource(if (canGenerate) R.string.staff_hr_empty_can_generate else R.string.staff_hr_empty_view_only),
                    icon = Icons.Outlined.Description,
                    action = generateButton,
                )
            }
        } else {
            item(key = "header") {
                SectionHeader(title = stringResource(R.string.staff_hr_count, state.letters.size), action = generateButton)
            }
            items(state.letters.size, key = { state.letters[it].id }) { index ->
                val letter = state.letters[index]
                HrLetterCard(letter, opening = state.openingId == letter.id, onDownload = { viewModel.download(letter.id) })
            }
        }
    }
}
