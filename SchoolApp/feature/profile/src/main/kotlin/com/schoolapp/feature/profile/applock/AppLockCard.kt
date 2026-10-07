package com.schoolapp.feature.profile.applock

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Fingerprint
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.data.applock.AppLockAvailability
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.profile.R

/** App lock switch; explains why it is unavailable when the phone has no screen lock. */
@Composable
internal fun AppLockCard(
    state: AppLockSettingsUiState,
    onEnable: () -> Unit,
    onDisable: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val title = stringResource(R.string.profile_app_lock)
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        ListItemRow(
            title = title,
            supporting = stringResource(state.supportingRes()),
            leadingIcon = Icons.Outlined.Fingerprint,
            trailing = {
                Switch(
                    checked = state.enabled,
                    onCheckedChange = { checked -> if (checked) onEnable() else onDisable() },
                    enabled = state.canToggle,
                    modifier = Modifier.semantics { contentDescription = title },
                    colors = SwitchDefaults.colors(checkedTrackColor = AppColors.Primary, checkedThumbColor = AppColors.OnPrimary),
                )
            },
        )
        state.promptError?.let {
            InlineMessage(text = it, tone = StatusTone.Error, modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp))
        }
    }
}

@StringRes
private fun AppLockSettingsUiState.supportingRes(): Int = when {
    !enabled && availability == AppLockAvailability.NO_DEVICE_LOCK -> R.string.profile_app_lock_no_device_lock
    !enabled && availability == AppLockAvailability.UNSUPPORTED -> R.string.profile_app_lock_unsupported
    recommended -> R.string.profile_app_lock_hint_staff
    else -> R.string.profile_app_lock_hint
}

@Preview(showBackground = true)
@Composable
private fun AppLockCardPreview() = SchoolTheme {
    AppLockCard(
        AppLockSettingsUiState(availability = AppLockAvailability.AVAILABLE, recommended = true),
        onEnable = {},
        onDisable = {},
    )
}

@Preview(showBackground = true)
@Composable
private fun AppLockCardNoLockPreview() = SchoolTheme {
    AppLockCard(AppLockSettingsUiState(availability = AppLockAvailability.NO_DEVICE_LOCK), onEnable = {}, onDisable = {})
}
