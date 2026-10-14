package com.schoolapp.feature.inventory.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.formatDate

/** `YYYY-MM-DD` date field; [date] may be blank for an optional date. */
@Composable
internal fun InventoryDateField(
    date: String,
    label: String,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
    minDate: String? = null,
    maxDate: String? = null,
    errorText: String? = null,
    enabled: Boolean = true,
) {
    var picking by rememberSaveable { mutableStateOf(false) }
    PickerField(
        value = formatDate(date.takeIf { it.isNotBlank() }).orEmpty(),
        label = label,
        onClick = { picking = true },
        modifier = modifier,
        errorText = errorText,
        enabled = enabled,
    )
    if (picking) {
        AppDatePickerDialog(
            initialDate = date.takeIf { it.isNotBlank() } ?: maxDate ?: minDate,
            minDate = minDate,
            maxDate = maxDate,
            onConfirm = {
                picking = false
                onDateSelected(it)
            },
            onDismiss = { picking = false },
        )
    }
}
