package com.schoolapp.feature.fees.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.formatDate

/** Date picker field that cannot go past [maxDate]. */
@Composable
internal fun FeesDateField(
    date: String,
    label: String,
    maxDate: String,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    enabled: Boolean = true,
) {
    var picking by rememberSaveable { mutableStateOf(false) }
    PickerField(
        value = formatDate(date).orEmpty(),
        label = label,
        onClick = { picking = true },
        modifier = modifier,
        errorText = errorText,
        enabled = enabled,
    )
    if (picking) {
        AppDatePickerDialog(
            initialDate = date,
            maxDate = maxDate,
            onConfirm = {
                picking = false
                onDateSelected(it)
            },
            onDismiss = { picking = false },
        )
    }
}
