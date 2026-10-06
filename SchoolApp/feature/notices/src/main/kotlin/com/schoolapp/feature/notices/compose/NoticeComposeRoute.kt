package com.schoolapp.feature.notices.compose

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.SwitchRow

@Composable
internal fun NoticeComposeRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NoticeComposeViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.result) {
        if (state.result != null) onBack()
    }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.notices_new), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        NoticeComposeContent(state, viewModel, Modifier.padding(padding))
    }
}

@Composable
private fun NoticeComposeContent(state: NoticeComposeUiState, viewModel: NoticeComposeViewModel, modifier: Modifier) {
    var pickExpiry by rememberSaveable { mutableStateOf(false) }
    val enabled = !state.isPublishing
    ScreenColumn(modifier) {
        state.error?.let { error -> item(key = "error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
        item(key = "title") {
            AppTextField(
                value = state.title,
                onValueChange = viewModel::onTitleChange,
                label = stringResource(R.string.notices_field_title),
                enabled = enabled,
                errorText = if (state.titleMissing) stringResource(R.string.notices_title_required) else null,
            )
        }
        item(key = "body") {
            AppTextArea(
                value = state.body,
                onValueChange = viewModel::onBodyChange,
                label = stringResource(R.string.notices_field_body),
                enabled = enabled,
                errorText = if (state.bodyMissing) stringResource(R.string.notices_body_required) else null,
            )
        }
        item(key = "audience") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(title = stringResource(R.string.notices_audience))
                AudiencePicker(state, enabled, viewModel::onAudienceChange, viewModel::onToggleClass, viewModel::onToggleSection)
                when {
                    state.audience == AudienceMode.BRANCH -> Unit
                    state.optionsLoading -> LoadingState()
                    state.optionsError != null -> ErrorState(appErrorMessage(state.optionsError), onRetry = viewModel::loadOptions)
                }
                if (state.audienceMissing) {
                    Text(stringResource(R.string.notices_audience_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
                }
            }
        }
        item(key = "expiry") {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                PickerField(
                    value = formatDate(state.expiresOn) ?: stringResource(R.string.notices_no_expiry),
                    label = stringResource(R.string.notices_expires_on_optional),
                    onClick = { pickExpiry = true },
                    enabled = enabled,
                    errorText = if (state.expiryInvalid) stringResource(R.string.notices_expiry_invalid) else null,
                )
                if (state.expiresOn != null && enabled) {
                    AppTextButton(stringResource(R.string.notices_clear_expiry), onClick = { viewModel.onExpiresOnChange(null) })
                }
            }
        }
        item(key = "pinned") {
            SwitchRow(
                title = stringResource(R.string.notices_pin),
                supporting = stringResource(R.string.notices_pin_supporting),
                checked = state.pinned,
                onCheckedChange = viewModel::onPinnedChange,
                enabled = enabled,
            )
        }
        item(key = "publish") { PrimaryButton(stringResource(R.string.notices_publish), viewModel::publish, loading = state.isPublishing) }
    }
    if (pickExpiry) {
        AppDatePickerDialog(
            initialDate = state.expiresOn ?: state.today,
            onConfirm = {
                pickExpiry = false
                viewModel.onExpiresOnChange(it)
            },
            onDismiss = { pickExpiry = false },
        )
    }
}
