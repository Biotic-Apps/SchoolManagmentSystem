package com.schoolapp.feature.pickup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.pickup.R
import java.time.LocalDate

/** Previous / next day arrows around a tap-to-pick date (like the web DateStepper); future days are allowed for early leave. */
@Composable
internal fun PickupDateBar(date: String, today: String, onDateChange: (String) -> Unit, modifier: Modifier = Modifier) {
    var picking by rememberSaveable { mutableStateOf(false) }
    val formatted = formatDate(date).orEmpty()
    val label = if (date == today) stringResource(R.string.pickup_today, formatted) else formatted
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        IconButton(onClick = { shift(date, -1)?.let(onDateChange) }) {
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowLeft, stringResource(R.string.pickup_previous_day), tint = AppColors.Primary)
        }
        PickerField(value = label, label = stringResource(R.string.pickup_leave_date), onClick = { picking = true }, modifier = Modifier.weight(1f))
        IconButton(onClick = { shift(date, 1)?.let(onDateChange) }) {
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, stringResource(R.string.pickup_next_day), tint = AppColors.Primary)
        }
    }
    if (picking) {
        AppDatePickerDialog(
            initialDate = date,
            onConfirm = {
                picking = false
                onDateChange(it)
            },
            onDismiss = { picking = false },
        )
    }
}

private fun shift(date: String, days: Long): String? =
    runCatching { LocalDate.parse(date).plusDays(days).toString() }.getOrNull()
