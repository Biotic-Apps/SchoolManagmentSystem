package com.schoolapp.feature.diary.components

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
import com.schoolapp.feature.diary.R

/** Previous / next day arrows around a tap-to-pick date field; future days are not selectable. */
@Composable
internal fun DateNavigator(
    date: String,
    today: String,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    onPick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var picking by rememberSaveable { mutableStateOf(false) }
    val label = formatDate(date).orEmpty().let { if (date == today) stringResource(R.string.diary_today_with_date, it) else it }
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        IconButton(onClick = onPrevious) {
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowLeft, stringResource(R.string.diary_previous_day), tint = AppColors.Primary)
        }
        PickerField(value = label, label = stringResource(R.string.diary_date), onClick = { picking = true }, modifier = Modifier.weight(1f))
        IconButton(onClick = onNext, enabled = date < today) {
            Icon(
                Icons.AutoMirrored.Outlined.KeyboardArrowRight,
                stringResource(R.string.diary_next_day),
                tint = if (date < today) AppColors.Primary else AppColors.Border,
            )
        }
    }
    if (picking) {
        AppDatePickerDialog(
            initialDate = date,
            maxDate = today,
            onConfirm = {
                picking = false
                onPick(it)
            },
            onDismiss = { picking = false },
        )
    }
}
