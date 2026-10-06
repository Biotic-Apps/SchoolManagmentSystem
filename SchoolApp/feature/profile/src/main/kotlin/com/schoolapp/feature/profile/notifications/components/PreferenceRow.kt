package com.schoolapp.feature.profile.notifications.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notification.NotificationPreference
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.profile.R

/** One category with its push switch; critical categories show a locked, always-on switch. */
@Composable
internal fun PreferenceRow(
    preference: NotificationPreference,
    saving: Boolean,
    onPushChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    val text = categoryText(preference.category)
    val label = text?.let { stringResource(it.labelRes) } ?: humanizeKey(preference.category)
    val pushLabel = stringResource(R.string.notifications_push_for, label)
    Row(
        modifier = modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(label, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            text?.let {
                Text(stringResource(it.descriptionRes), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            if (preference.isCritical) {
                StatusChip(stringResource(R.string.notifications_always_on), StatusTone.Info)
            }
        }
        Switch(
            checked = preference.push || preference.isCritical,
            onCheckedChange = onPushChange,
            enabled = !preference.isCritical && !saving,
            modifier = Modifier.semantics { contentDescription = pushLabel },
            colors = SwitchDefaults.colors(checkedTrackColor = AppColors.Primary, checkedThumbColor = AppColors.OnPrimary),
        )
    }
}
