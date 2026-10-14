package com.schoolapp.feature.settings.notifications

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
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

/** Settings › Notifications: delivery channels, channels per category and the WhatsApp message log. */
@Composable
internal fun NotificationsTab(schoolId: String, canEdit: Boolean, modifier: Modifier = Modifier) {
    val viewModel: NotificationsViewModel = hiltViewModel(key = "notifications_$schoolId")
    LaunchedEffect(schoolId) { viewModel.bind(schoolId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    when {
        state.isLoading -> LoadingState(modifier)
        !state.loaded -> ErrorState(
            message = state.error?.let { loadErrorMessage(it) } ?: stringResource(R.string.settings_notifications_load_failed),
            modifier = modifier,
            onRetry = viewModel::retry,
        )
        else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
            ScreenColumn {
                if (!canEdit) item(key = "read_only") { ReadOnlyNotice() }
                state.saveError?.let { item(key = "save_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                if (state.saved && !state.dirty) {
                    item(key = "saved") { InlineMessage(stringResource(R.string.settings_notifications_saved), StatusTone.Success) }
                }
                item(key = "channels") { ChannelCards(state, canEdit, viewModel::edit) }
                item(key = "categories") { CategoryDefaultsCard(state.form, canEdit, viewModel::edit) }
                if (canEdit) {
                    item(key = "actions") {
                        SettingsFormActions(state.dirty, state.saving, viewModel::save, viewModel::discard)
                    }
                }
                whatsAppLogItems(state.log, viewModel::filterLog, viewModel::logPage, viewModel::retryLog)
            }
        }
    }
}
