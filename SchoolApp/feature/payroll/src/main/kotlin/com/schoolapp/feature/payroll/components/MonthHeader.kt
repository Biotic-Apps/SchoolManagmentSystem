package com.schoolapp.feature.payroll.components

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
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.payroll.R
import java.time.YearMonth

/** Previous / next month switcher; next is disabled at the current month (no future payslips). */
@Composable
internal fun MonthHeader(
    month: YearMonth,
    canGoNext: Boolean,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = onPrevious) {
            Icon(
                Icons.AutoMirrored.Outlined.KeyboardArrowLeft,
                stringResource(R.string.payroll_previous_month),
                tint = AppColors.TextPrimary,
            )
        }
        Text(
            month.label(),
            style = MaterialTheme.typography.titleMedium,
            color = AppColors.TextPrimary,
            textAlign = TextAlign.Center,
            modifier = Modifier.weight(1f),
        )
        IconButton(onClick = onNext, enabled = canGoNext) {
            Icon(
                Icons.AutoMirrored.Outlined.KeyboardArrowRight,
                stringResource(R.string.payroll_next_month),
                tint = if (canGoNext) AppColors.TextPrimary else AppColors.Border,
            )
        }
    }
}
