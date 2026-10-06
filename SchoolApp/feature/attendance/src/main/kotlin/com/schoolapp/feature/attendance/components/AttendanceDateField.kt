package com.schoolapp.feature.attendance.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.attendance.R

/** Register date picker; future dates cannot be chosen. */
@Composable
internal fun AttendanceDateField(date: String, today: String, onDateSelected: (String) -> Unit, modifier: Modifier = Modifier) {
    var picking by rememberSaveable { mutableStateOf(false) }
    val label = if (date == today) stringResource(R.string.attendance_today_date, formatDate(date).orEmpty()) else formatDate(date).orEmpty()
    PickerField(
        value = label,
        label = stringResource(R.string.attendance_date),
        onClick = { picking = true },
        modifier = modifier,
    )
    if (picking) {
        AppDatePickerDialog(
            initialDate = date,
            maxDate = today,
            onConfirm = {
                picking = false
                onDateSelected(it)
            },
            onDismiss = { picking = false },
        )
    }
}
