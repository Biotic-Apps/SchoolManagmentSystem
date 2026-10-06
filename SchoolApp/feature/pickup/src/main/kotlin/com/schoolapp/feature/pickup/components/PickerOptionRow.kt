package com.schoolapp.feature.pickup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.selection.selectable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Verified
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.pickup.Picker
import com.schoolapp.feature.pickup.R

/** Selectable guardian / pickup person with a verified badge or a "Not verified" warning. */
@Composable
internal fun PickerOptionRow(picker: Picker, selected: Boolean, enabled: Boolean, onSelect: () -> Unit, modifier: Modifier = Modifier) {
    val relation = listOfNotNull(
        picker.relation?.takeIf { it.isNotBlank() },
        stringResource(R.string.pickup_guardian).takeIf { picker.isGuardian },
    ).distinct().joinToString(" · ")
    PersonRow(
        name = picker.name,
        supporting = relation,
        photoUrl = picker.photoUrl,
        modifier = modifier.selectable(selected = selected, enabled = enabled, role = Role.RadioButton, onClick = onSelect),
        trailing = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Column(horizontalAlignment = Alignment.End) {
                    if (picker.verified) {
                        StatusChip(stringResource(R.string.pickup_status_verified), StatusTone.Success, icon = Icons.Outlined.Verified)
                    } else {
                        StatusChip(stringResource(R.string.pickup_not_verified), StatusTone.Warning, icon = Icons.Outlined.WarningAmber)
                    }
                }
                RadioButton(
                    selected = selected,
                    onClick = null,
                    enabled = enabled,
                    colors = RadioButtonDefaults.colors(selectedColor = AppColors.Primary),
                )
            }
        },
    )
}
