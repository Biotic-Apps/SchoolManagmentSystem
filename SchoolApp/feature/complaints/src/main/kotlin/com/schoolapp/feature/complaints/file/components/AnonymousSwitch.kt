package com.schoolapp.feature.complaints.file.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.complaints.R

/** "File anonymously" with its privacy note; the whole row toggles. */
@Composable
internal fun AnonymousSwitch(checked: Boolean, onChange: (Boolean) -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
    AppCard(modifier) {
        Row(
            modifier = Modifier.toggleable(value = checked, enabled = enabled, role = Role.Switch, onValueChange = onChange),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(stringResource(R.string.complaints_anonymous), style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                Text(stringResource(R.string.complaints_anonymous_help), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            Switch(
                checked = checked,
                onCheckedChange = null,
                enabled = enabled,
                colors = SwitchDefaults.colors(
                    checkedTrackColor = AppColors.Primary,
                    checkedThumbColor = AppColors.OnPrimary,
                    uncheckedBorderColor = AppColors.Border,
                    uncheckedTrackColor = AppColors.Background,
                    uncheckedThumbColor = AppColors.TextSecondary,
                ),
            )
        }
    }
}
