package com.schoolapp.feature.meetings.staff.slots.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatDateRange
import com.schoolapp.feature.meetings.R

/** Week pager plus "Add slots"; wraps onto two lines on narrow screens, one line on tablets. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun SlotsWeekHeader(
    weekStart: String,
    weekEnd: String,
    isThisWeek: Boolean,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    onThisWeek: () -> Unit,
    onAdd: () -> Unit,
    modifier: Modifier = Modifier,
) {
    FlowRow(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalArrangement = Arrangement.spacedBy(8.dp),
        itemVerticalAlignment = Alignment.CenterVertically,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onPrevious) {
                Icon(Icons.AutoMirrored.Outlined.KeyboardArrowLeft, stringResource(R.string.meetings_previous_week), tint = AppColors.Primary)
            }
            Text(
                formatDateRange(weekStart, weekEnd).orEmpty(),
                style = MaterialTheme.typography.titleSmall,
                color = AppColors.TextPrimary,
            )
            IconButton(onClick = onNext) {
                Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, stringResource(R.string.meetings_next_week), tint = AppColors.Primary)
            }
            if (!isThisWeek) AppTextButton(stringResource(R.string.meetings_this_week), onThisWeek)
        }
        PrimaryButton(stringResource(R.string.meetings_add_slots), onAdd, leadingIcon = Icons.Outlined.Add)
    }
}
