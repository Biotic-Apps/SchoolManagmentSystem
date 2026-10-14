package com.schoolapp.feature.settings.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.settings.R

/** Save / Discard bar at the bottom of a settings form; [blocked] disables saving for a reason shown elsewhere. */
@Composable
internal fun SettingsFormActions(
    dirty: Boolean,
    saving: Boolean,
    onSave: () -> Unit,
    onDiscard: () -> Unit,
    modifier: Modifier = Modifier,
    blocked: Boolean = false,
) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (dirty) {
            Text(
                text = stringResource(R.string.settings_unsaved_changes),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton(
                text = stringResource(R.string.settings_discard),
                onClick = onDiscard,
                enabled = dirty && !saving,
                modifier = Modifier.weight(1f),
            )
            PrimaryButton(
                text = stringResource(R.string.settings_save_changes),
                onClick = onSave,
                enabled = dirty && !blocked,
                loading = saving,
                leadingIcon = Icons.Outlined.Save,
                modifier = Modifier.weight(1f),
            )
        }
    }
}
