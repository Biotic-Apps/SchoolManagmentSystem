package com.schoolapp.feature.health.menu

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.health.R

/** From / To date fields that filter the incidents list; "to" never goes past today. */
@Composable
internal fun IncidentRangeBar(
    from: String,
    to: String,
    today: String,
    onFromChange: (String) -> Unit,
    onToChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var editing by rememberSaveable { mutableStateOf<String?>(null) }
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        PickerField(
            value = formatDate(from).orEmpty(),
            label = stringResource(R.string.health_range_from),
            onClick = { editing = FROM },
            modifier = Modifier.weight(1f),
        )
        PickerField(
            value = formatDate(to).orEmpty(),
            label = stringResource(R.string.health_range_to),
            onClick = { editing = TO },
            modifier = Modifier.weight(1f),
        )
    }
    when (editing) {
        FROM -> AppDatePickerDialog(
            initialDate = from,
            maxDate = today,
            onConfirm = { editing = null; onFromChange(it) },
            onDismiss = { editing = null },
        )
        TO -> AppDatePickerDialog(
            initialDate = to,
            maxDate = today,
            onConfirm = { editing = null; onToChange(it) },
            onDismiss = { editing = null },
        )
    }
}

private const val FROM = "from"
private const val TO = "to"
