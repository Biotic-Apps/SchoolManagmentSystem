package com.schoolapp.feature.settings.support

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
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
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.settings.R

/** Optional `YYYY-MM-DD` filter with a date picker and a clear button. */
@Composable
internal fun DateFilterField(
    label: String,
    value: String?,
    onChange: (String?) -> Unit,
    modifier: Modifier = Modifier,
    minDate: String? = null,
    maxDate: String? = null,
) {
    var open by rememberSaveable { mutableStateOf(false) }
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        PickerField(
            value = formatDate(value) ?: stringResource(R.string.settings_support_any_date),
            label = label,
            onClick = { open = true },
            modifier = Modifier.weight(1f),
        )
        if (value != null) {
            IconButton(onClick = { onChange(null) }) {
                Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.settings_support_clear_date, label))
            }
        }
    }
    if (open) {
        AppDatePickerDialog(
            initialDate = value,
            onConfirm = {
                open = false
                onChange(it)
            },
            onDismiss = { open = false },
            minDate = minDate,
            maxDate = maxDate,
        )
    }
}

/** From / To pair, side by side. */
@Composable
internal fun DateRangeRow(from: String?, to: String?, onFrom: (String?) -> Unit, onTo: (String?) -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        DateFilterField(stringResource(R.string.settings_support_from), from, onFrom, Modifier.weight(1f), maxDate = to)
        DateFilterField(stringResource(R.string.settings_support_to), to, onTo, Modifier.weight(1f), minDate = from)
    }
}
