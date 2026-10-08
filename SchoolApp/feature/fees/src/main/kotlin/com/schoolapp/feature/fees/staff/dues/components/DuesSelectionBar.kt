package com.schoolapp.feature.fees.staff.dues.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.NotificationsActive
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.fees.R

/** Select all + count + "Send reminders" (web `DuesSelectionBar`). */
@Composable
internal fun DuesSelectionBar(
    selectedCount: Int,
    allSelected: Boolean,
    hasRows: Boolean,
    sending: Boolean,
    onToggleAll: () -> Unit,
    onClear: () -> Unit,
    onSend: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier, contentPadding = 12.dp) {
        Row(
            Modifier.fillMaxWidth().toggleable(value = allSelected, enabled = hasRows, role = Role.Checkbox, onValueChange = { onToggleAll() }),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Checkbox(checked = allSelected, onCheckedChange = null, enabled = hasRows, colors = CheckboxDefaults.colors(checkedColor = AppColors.Primary))
            Text(stringResource(R.string.fees_select_all), style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
            Text(
                pluralStringResource(R.plurals.fees_selected_count, selectedCount, selectedCount),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
            if (selectedCount > 0) AppTextButton(stringResource(R.string.fees_clear_selection), onClear, enabled = !sending)
            PrimaryButton(
                text = stringResource(R.string.fees_send_reminders),
                onClick = onSend,
                enabled = selectedCount > 0,
                loading = sending,
                leadingIcon = Icons.Outlined.NotificationsActive,
            )
        }
    }
}
