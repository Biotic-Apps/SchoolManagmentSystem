package com.schoolapp.feature.timetable.teacherweek

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R
import java.time.LocalDate

/** "‹  Week of 12 Oct 2026  ›" plus "This week" when another week is shown. */
@Composable
internal fun WeekNavRow(monday: LocalDate, isThisWeek: Boolean, onMove: (Int) -> Unit, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = { onMove(-1) }) {
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowLeft, contentDescription = stringResource(R.string.tt_prev_week))
        }
        Text(
            stringResource(R.string.tt_week_of, TimeFormat.formatDate(monday)),
            style = MaterialTheme.typography.titleSmall,
            color = AppColors.TextPrimary,
            textAlign = TextAlign.Center,
            modifier = Modifier.weight(1f),
        )
        IconButton(onClick = { onMove(1) }) {
            Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = stringResource(R.string.tt_next_week))
        }
        if (!isThisWeek) AppTextButton(stringResource(R.string.tt_this_week), onClick = { onMove(0) })
    }
}
