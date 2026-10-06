package com.schoolapp.feature.profile.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.Devices
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.VerifiedUser
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.profile.R

@Composable
internal fun SecurityCard(
    twoFactorEnabled: Boolean,
    onChangePassword: () -> Unit,
    onDeviceSessions: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        SectionHeader(
            title = stringResource(R.string.profile_security_title),
            modifier = Modifier.padding(horizontal = 16.dp),
        )
        ListItemRow(
            title = stringResource(R.string.profile_change_password),
            supporting = stringResource(R.string.profile_change_password_hint),
            leadingIcon = Icons.Outlined.Lock,
            onClick = onChangePassword,
            trailing = { Chevron() },
        )
        HorizontalDivider(color = AppColors.Border)
        ListItemRow(
            title = stringResource(R.string.profile_devices),
            supporting = stringResource(R.string.profile_devices_hint),
            leadingIcon = Icons.Outlined.Devices,
            onClick = onDeviceSessions,
            trailing = { Chevron() },
        )
        HorizontalDivider(color = AppColors.Border)
        // Read-only on Android: setup needs a QR code, which lives on the web panel.
        ListItemRow(
            title = stringResource(R.string.profile_two_factor),
            supporting = stringResource(R.string.profile_two_factor_hint),
            leadingIcon = Icons.Outlined.VerifiedUser,
            trailing = {
                StatusChip(
                    text = stringResource(if (twoFactorEnabled) R.string.profile_two_factor_on else R.string.profile_two_factor_off),
                    tone = if (twoFactorEnabled) StatusTone.Success else StatusTone.Neutral,
                )
            },
        )
    }
}

@Composable
private fun Chevron() =
    Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = null, tint = AppColors.TextSecondary)

@Preview(showBackground = true)
@Composable
private fun SecurityCardPreview() = SchoolTheme { SecurityCard(twoFactorEnabled = true, onChangePassword = {}, onDeviceSessions = {}) }
