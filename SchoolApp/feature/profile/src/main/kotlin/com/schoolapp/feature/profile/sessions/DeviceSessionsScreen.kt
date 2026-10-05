package com.schoolapp.feature.profile.sessions

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.profile.DeviceSession
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.sessions.components.DeviceSessionCard
import androidx.compose.foundation.layout.fillMaxWidth

@Composable
fun DeviceSessionsScreen(
    state: DeviceSessionsUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onRevoke: (String) -> Unit,
    onLogoutAll: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var pendingRevoke by rememberSaveable { mutableStateOf<String?>(null) }
    var confirmLogoutAll by rememberSaveable { mutableStateOf(false) }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(title = stringResource(R.string.sessions_title), navigationIcon = { BackButton(onBack) })
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError), body, onRetry = onRetry)
            else -> ScreenColumn(body) {
                state.actionError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                items(state.sessions, key = { it.id }) { session ->
                    DeviceSessionCard(
                        session = session,
                        revoking = state.revokingId == session.id,
                        onRevoke = { pendingRevoke = session.id },
                    )
                }
                item(key = "logout-all") {
                    SecondaryButton(
                        text = stringResource(R.string.sessions_logout_all),
                        onClick = { confirmLogoutAll = true },
                        loading = state.isLoggingOutAll,
                        contentColor = AppColors.Error,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
    pendingRevoke?.let { id ->
        ConfirmDialog(
            title = stringResource(R.string.sessions_revoke_title),
            message = stringResource(R.string.sessions_revoke_message),
            confirmLabel = stringResource(R.string.sessions_revoke),
            onConfirm = {
                pendingRevoke = null
                onRevoke(id)
            },
            onDismiss = { pendingRevoke = null },
            destructive = true,
        )
    }
    if (confirmLogoutAll) {
        ConfirmDialog(
            title = stringResource(R.string.sessions_logout_all_title),
            message = stringResource(R.string.sessions_logout_all_message),
            confirmLabel = stringResource(R.string.sessions_logout_all),
            onConfirm = {
                confirmLogoutAll = false
                onLogoutAll()
            },
            onDismiss = { confirmLogoutAll = false },
            destructive = true,
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun DeviceSessionsScreenPreview() = SchoolTheme {
    DeviceSessionsScreen(
        state = DeviceSessionsUiState(
            isLoading = false,
            sessions = listOf(
                DeviceSession("1", "Pixel 8", "ANDROID", "192.168.1.4", null, "2026-10-05T08:00:00Z", current = true),
                DeviceSession("2", "Chrome on Windows", "WEB", "10.0.0.2", null, "2026-10-01T08:00:00Z", current = false),
            ),
        ),
        onBack = {}, onRetry = {}, onRevoke = {}, onLogoutAll = {},
    )
}
