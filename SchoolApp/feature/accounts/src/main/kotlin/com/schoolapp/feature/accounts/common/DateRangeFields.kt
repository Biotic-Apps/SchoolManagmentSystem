package com.schoolapp.feature.accounts.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.accounts.R

/** "From" / "To" date pickers side by side; empty values show [emptyLabel]. */
@Composable
internal fun DateRangeFields(
    from: String?,
    to: String?,
    onFrom: (String) -> Unit,
    onTo: (String) -> Unit,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    emptyLabel: String = "",
) {
    var picking by remember { mutableStateOf<Boolean?>(null) }
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        PickerField(
            value = formatDate(from) ?: emptyLabel,
            label = stringResource(R.string.accounts_from),
            onClick = { picking = true },
            modifier = Modifier.weight(1f),
            errorText = errorText,
        )
        PickerField(
            value = formatDate(to) ?: emptyLabel,
            label = stringResource(R.string.accounts_to),
            onClick = { picking = false },
            modifier = Modifier.weight(1f),
        )
    }
    picking?.let { isFrom ->
        AppDatePickerDialog(
            initialDate = if (isFrom) from else to,
            onConfirm = { date ->
                if (isFrom) onFrom(date) else onTo(date)
                picking = null
            },
            onDismiss = { picking = null },
            minDate = if (isFrom) null else from?.takeIf { it.isNotEmpty() },
            maxDate = if (isFrom) to?.takeIf { it.isNotEmpty() } else null,
        )
    }
}
