package com.schoolapp.feature.settings.notifications

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.CategoryChannels
import com.schoolapp.feature.settings.R

/** Which channels each kind of notification uses, unless a person changes their own preferences. */
@Composable
internal fun CategoryDefaultsCard(form: NotificationForm, canEdit: Boolean, onEdit: ((NotificationForm) -> NotificationForm) -> Unit) {
    AppCard(verticalSpacing = 12.dp, animateSize = false) {
        SectionHeader(
            title = stringResource(R.string.settings_notifications_categories),
            subtitle = stringResource(R.string.settings_notifications_categories_hint),
        )
        if (form.categories.isEmpty()) {
            Text(
                text = stringResource(R.string.settings_notifications_categories_empty),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        }
        form.categories.forEachIndexed { index, row ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            CategoryRow(row, form, canEdit) { channel, on ->
                onEdit { current ->
                    current.copy(categories = current.categories.map { if (it.category == row.category) it.with(channel, on) else it })
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun CategoryRow(row: CategoryChannels, form: NotificationForm, canEdit: Boolean, onToggle: (Channel, Boolean) -> Unit) {
    val label = categoryLabel(row.category)
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label.title, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        label.hint?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Channel.entries.forEach { channel ->
                val selected = row.isOn(channel)
                FilterChip(
                    selected = selected,
                    onClick = { onToggle(channel, !selected) },
                    enabled = canEdit && form.channelOn(channel),
                    label = { Text(stringResource(channel.label())) },
                    leadingIcon = if (selected) {
                        { Icon(Icons.Outlined.Check, contentDescription = null, modifier = Modifier) }
                    } else {
                        null
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.Selected,
                        selectedLabelColor = AppColors.OnSelected,
                        selectedLeadingIconColor = AppColors.OnSelected,
                    ),
                )
            }
        }
    }
}

private fun Channel.label(): Int = when (this) {
    Channel.IN_APP -> R.string.settings_notifications_in_app
    Channel.EMAIL -> R.string.settings_notifications_email
    Channel.SMS -> R.string.settings_notifications_sms
    Channel.WHATSAPP -> R.string.settings_notifications_whatsapp
    Channel.PUSH -> R.string.settings_notifications_push
}
