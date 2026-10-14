package com.schoolapp.feature.admin.roles.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowDropDown
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.roles.SchoolOption
import com.schoolapp.feature.admin.R

/** Limits a new role to one school; "All schools (global)" (empty id) is offered to Super Admin only. */
@Composable
internal fun SchoolPickerField(
    schools: List<SchoolOption>,
    selectedId: String,
    allowGlobal: Boolean,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    val label = stringResource(R.string.roles_school_label)
    val globalLabel = stringResource(R.string.roles_school_global)
    val options = buildList {
        if (allowGlobal) add("" to globalLabel)
        schools.forEach { add(it.id to it.name) }
    }
    PickerField(
        value = options.firstOrNull { it.first == selectedId }?.second.orEmpty(),
        label = label,
        onClick = { open = true },
        modifier = modifier,
        icon = Icons.Outlined.ArrowDropDown,
    )
    if (open) {
        AppBottomSheet(title = label, onDismiss = { open = false }) {
            options.forEach { (id, name) ->
                val selected = id == selectedId
                ListItemRow(
                    title = name,
                    selected = selected,
                    onClick = {
                        open = false
                        onSelect(id)
                    },
                    trailing = if (selected) {
                        { Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.Primary) }
                    } else {
                        null
                    },
                )
            }
        }
    }
}
