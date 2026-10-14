package com.schoolapp.feature.activities.participants.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.participants.ParticipantRow

/** One participant: name with remove, then role / position / result / remarks fields. */
@Composable
internal fun ParticipantRowCard(
    row: ParticipantRow,
    enabled: Boolean,
    onChange: (ParticipantRow) -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(row.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
                IconButton(onClick = onRemove, enabled = enabled) {
                    Icon(Icons.Outlined.Delete, stringResource(R.string.activities_participant_remove), tint = AppColors.Error)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AppTextField(
                    value = row.role,
                    onValueChange = { onChange(row.copy(role = it)) },
                    label = stringResource(R.string.activities_participant_role),
                    enabled = enabled,
                    modifier = Modifier.weight(2f),
                )
                AppTextField(
                    value = row.position,
                    onValueChange = { onChange(row.copy(position = it)) },
                    label = stringResource(R.string.activities_participant_position),
                    enabled = enabled,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(1f),
                )
            }
            AppTextField(
                value = row.result,
                onValueChange = { onChange(row.copy(result = it)) },
                label = stringResource(R.string.activities_participant_result),
                enabled = enabled,
            )
            AppTextField(
                value = row.remarks,
                onValueChange = { onChange(row.copy(remarks = it)) },
                label = stringResource(R.string.activities_participant_remarks),
                enabled = enabled,
            )
        }
    }
}
