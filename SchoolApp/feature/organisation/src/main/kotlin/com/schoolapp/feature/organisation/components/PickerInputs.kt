package com.schoolapp.feature.organisation.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTimePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime

/** Date input holding the API's `YYYY-MM-DD`; shows the formatted date. */
@Composable
internal fun DateInput(
    value: String,
    label: String,
    onChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    minDate: String? = null,
    maxDate: String? = null,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    PickerField(
        value = formatDate(value.ifEmpty { null }).orEmpty(),
        label = label,
        onClick = { open = true },
        modifier = modifier,
        errorText = errorText,
    )
    if (open) {
        AppDatePickerDialog(
            initialDate = value.ifEmpty { minDate },
            onConfirm = {
                onChange(it)
                open = false
            },
            onDismiss = { open = false },
            minDate = minDate,
            maxDate = maxDate,
        )
    }
}

/** Time input holding 24-hour `HH:mm`; shown and picked on the 12-hour clock. */
@Composable
internal fun TimeInput(
    value: String,
    label: String,
    onChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    errorText: String? = null,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    PickerField(
        value = formatTime(value.ifEmpty { null }).orEmpty(),
        label = label,
        onClick = { open = true },
        modifier = modifier,
        errorText = errorText,
        icon = Icons.Outlined.Schedule,
    )
    if (open) {
        AppTimePickerDialog(
            initialTime = value,
            onConfirm = {
                onChange(it)
                open = false
            },
            onDismiss = { open = false },
            title = label,
        )
    }
}
