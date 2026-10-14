package com.schoolapp.feature.payroll.rules

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.setup.PayRules
import com.schoolapp.core.model.payroll.setup.PerDayBase
import com.schoolapp.core.model.payroll.setup.WorkingDaysMode
import com.schoolapp.feature.payroll.R
import kotlin.math.roundToLong

// A sample salary so the rules read as real money.
private const val BASIC = 6_000_000L
private const val ALLOWANCES = 1_100_000L
private const val CALENDAR_DAYS = 26

/** Live worked example of the rules being edited. */
@Composable
internal fun PayRulesExample(rules: PayRules, hours: Double, modifier: Modifier = Modifier) {
    val fixed = rules.workingDaysMode == WorkingDaysMode.FIXED
    val days = if (fixed) rules.fixedWorkingDays else CALENDAR_DAYS
    val base = if (rules.perDayBase == PerDayBase.BASIC) BASIC else BASIC + ALLOWANCES
    val perDay = (base.toDouble() / days.coerceAtLeast(1)).roundToLong()
    val hourly = (BASIC / (days * hours).coerceAtLeast(1.0) * rules.overtimeMultiplier).roundToLong()
    val lateDays = rules.lateDeductionDays
    val lateText = when (lateDays) {
        0.5 -> stringResource(R.string.payroll_rules_half_day_text)
        1.0 -> stringResource(R.string.payroll_rules_day_text)
        else -> stringResource(R.string.payroll_rules_days_text, hoursText(lateDays))
    }
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 6.dp) {
        Text(stringResource(R.string.payroll_rules_example), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        Line(
            stringResource(
                if (fixed) R.string.payroll_rules_example_intro_fixed else R.string.payroll_rules_example_intro_calendar,
                MoneyFormat.format(BASIC),
                MoneyFormat.format(ALLOWANCES),
                days,
            ),
        )
        Line(stringResource(R.string.payroll_rules_example_absent, MoneyFormat.format(perDay)))
        Line(
            if (rules.latesPerDeduction > 0) {
                stringResource(R.string.payroll_rules_example_lates, rules.latesPerDeduction, lateText, MoneyFormat.format((perDay * lateDays).roundToLong()))
            } else {
                stringResource(R.string.payroll_rules_example_no_lates)
            },
        )
        Line(stringResource(R.string.payroll_rules_example_leave))
        Line(
            if (rules.overtimeEnabled) {
                stringResource(R.string.payroll_rules_example_overtime, MoneyFormat.format(hourly), hoursText(hours), hoursText(rules.overtimeMultiplier))
            } else {
                stringResource(R.string.payroll_rules_example_no_overtime)
            },
        )
    }
}

@Composable
private fun Line(text: String) = Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
