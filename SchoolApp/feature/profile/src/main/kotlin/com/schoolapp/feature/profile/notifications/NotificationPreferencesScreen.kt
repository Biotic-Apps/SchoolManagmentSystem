package com.schoolapp.feature.profile.notifications

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.notification.NotificationPreference
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.profile.R
import com.schoolapp.feature.profile.notifications.components.PreferenceRow

@Composable
fun NotificationPreferencesScreen(
    state: NotificationPreferencesUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onPushChange: (category: String, enabled: Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.notifications_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.loadError != null -> ErrorState(appErrorMessage(state.loadError), body, onRetry = onRetry)
            state.items.isEmpty() -> EmptyState(title = stringResource(R.string.notifications_empty), modifier = body)
            else -> ScreenColumn(body) {
                item(key = "intro") {
                    Text(
                        stringResource(R.string.notifications_in_app_note),
                        style = MaterialTheme.typography.bodyMedium,
                        color = AppColors.TextSecondary,
                    )
                }
                state.saveError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                item(key = "list") {
                    AppCard(Modifier.fillMaxWidth(), contentPadding = 0.dp) {
                        SectionHeader(
                            title = stringResource(R.string.notifications_push_title),
                            modifier = Modifier.padding(horizontal = 16.dp),
                        )
                        state.items.forEachIndexed { index, preference ->
                            if (index > 0) HorizontalDivider(color = AppColors.Border)
                            PreferenceRow(
                                preference = preference,
                                saving = preference.category in state.saving,
                                onPushChange = { onPushChange(preference.category, it) },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun NotificationPreferencesPreview() = SchoolTheme {
    NotificationPreferencesScreen(
        state = NotificationPreferencesUiState(
            isLoading = false,
            items = listOf(
                NotificationPreference("ATTENDANCE", inApp = true, push = true),
                NotificationPreference("NOTICE", inApp = true, push = false),
                NotificationPreference("HEALTH", inApp = true, push = true),
            ),
        ),
        onBack = {}, onRetry = {}, onPushChange = { _, _ -> },
    )
}
