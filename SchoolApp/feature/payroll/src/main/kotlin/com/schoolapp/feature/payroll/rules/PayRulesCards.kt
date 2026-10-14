package com.schoolapp.feature.payroll.rules

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.setup.PayRules
import com.schoolapp.core.model.payroll.setup.PayRulesView
import com.schoolapp.core.model.payroll.setup.PerDayBase
import com.schoolapp.core.model.payroll.setup.WorkingDaysMode
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.payroll.R

private val LateDays = listOf(0.5, 1.0, 2.0)
private val Multipliers = listOf(1.0, 1.25, 1.5, 2.0)

@Composable
internal fun WorkingDaysCard(rules: PayRules, enabled: Boolean, onEdit: ((PayRules) -> PayRules) -> Unit) {
    RulesCard(R.string.payroll_rules_working_days, R.string.payroll_rules_working_days_help) {
        Label(R.string.payroll_rules_count_from)
        Segments(
            labels = listOf(stringResource(R.string.payroll_rules_mode_calendar), stringResource(R.string.payroll_rules_mode_fixed)),
            selected = rules.workingDaysMode.ordinal,
            enabled = enabled,
            onSelect = { index -> onEdit { it.copy(workingDaysMode = WorkingDaysMode.entries[index]) } },
        )
        Hint(if (rules.workingDaysMode == WorkingDaysMode.FIXED) R.string.payroll_rules_mode_fixed_hint else R.string.payroll_rules_mode_calendar_hint)
        if (rules.workingDaysMode == WorkingDaysMode.FIXED) {
            NumberStepper(
                value = rules.fixedWorkingDays,
                onValueChange = { days -> onEdit { it.copy(fixedWorkingDays = days) } },
                label = stringResource(R.string.payroll_rules_fixed_days),
                min = 1,
                max = 31,
                enabled = enabled,
            )
        }
        Label(R.string.payroll_rules_per_day)
        Segments(
            labels = listOf(stringResource(R.string.payroll_rules_per_day_gross), stringResource(R.string.payroll_rules_per_day_basic)),
            selected = rules.perDayBase.ordinal,
            enabled = enabled,
            onSelect = { index -> onEdit { it.copy(perDayBase = PerDayBase.entries[index]) } },
        )
        Hint(if (rules.perDayBase == PerDayBase.BASIC) R.string.payroll_rules_per_day_basic_hint else R.string.payroll_rules_per_day_gross_hint)
    }
}

@Composable
internal fun LatesCard(rules: PayRules, enabled: Boolean, onEdit: ((PayRules) -> PayRules) -> Unit) {
    RulesCard(R.string.payroll_rules_lates, R.string.payroll_rules_lates_help) {
        NumberStepper(
            value = rules.latesPerDeduction,
            onValueChange = { count -> onEdit { it.copy(latesPerDeduction = count) } },
            label = stringResource(R.string.payroll_rules_lates_allowed),
            min = 0,
            max = 31,
            enabled = enabled,
        )
        Hint(R.string.payroll_rules_lates_allowed_hint)
        Label(R.string.payroll_rules_each_time)
        Segments(
            labels = listOf(
                stringResource(R.string.payroll_rules_half_day),
                stringResource(R.string.payroll_rules_one_day),
                stringResource(R.string.payroll_rules_two_days),
            ),
            selected = LateDays.indexOf(rules.lateDeductionDays).coerceAtLeast(0),
            enabled = enabled,
            onSelect = { index -> onEdit { it.copy(lateDeductionDays = LateDays[index]) } },
        )
    }
}

@Composable
internal fun OvertimeRulesCard(
    rules: PayRules,
    view: PayRulesView,
    dailyHours: String,
    dailyHoursInvalid: Boolean,
    enabled: Boolean,
    onEdit: ((PayRules) -> PayRules) -> Unit,
    onDailyHours: (String) -> Unit,
) {
    RulesCard(R.string.payroll_rules_overtime, R.string.payroll_rules_overtime_help) {
        SwitchRow(
            title = stringResource(R.string.payroll_rules_pay_overtime),
            checked = rules.overtimeEnabled,
            onCheckedChange = { on -> onEdit { it.copy(overtimeEnabled = on) } },
            supporting = stringResource(R.string.payroll_rules_pay_overtime_hint),
            enabled = enabled,
        )
        if (rules.overtimeEnabled) {
            Label(R.string.payroll_rules_overtime_pays)
            Segments(
                labels = Multipliers.map { "${hoursText(it)}×" },
                selected = Multipliers.indexOf(rules.overtimeMultiplier).coerceAtLeast(0),
                enabled = enabled,
                onSelect = { index -> onEdit { it.copy(overtimeMultiplier = Multipliers[index]) } },
            )
            Hint(R.string.payroll_rules_overtime_pays_hint)
            NumberStepper(
                value = rules.overtimeGraceMinutes,
                onValueChange = { minutes -> onEdit { it.copy(overtimeGraceMinutes = minutes) } },
                label = stringResource(R.string.payroll_rules_grace),
                min = 0,
                max = 240,
                step = 5,
                enabled = enabled,
            )
            Hint(R.string.payroll_rules_grace_hint)
            val arrives = view.staffArrivesAt
            val leaves = view.staffLeavesAt
            val branchHours = view.branchDailyHours
            AppTextField(
                value = dailyHours,
                onValueChange = onDailyHours,
                label = stringResource(R.string.payroll_rules_daily_hours),
                placeholder = branchHours?.let(::hoursText) ?: "8",
                supportingText = if (arrives != null && leaves != null && branchHours != null) {
                    stringResource(R.string.payroll_rules_daily_hours_branch, formatTime(arrives).orEmpty(), formatTime(leaves).orEmpty(), hoursText(branchHours))
                } else {
                    stringResource(R.string.payroll_rules_daily_hours_default)
                },
                errorText = if (dailyHoursInvalid) stringResource(R.string.payroll_rules_daily_hours_invalid) else null,
                enabled = enabled,
                kind = FieldKind.Decimal,
            )
        }
        Hint(R.string.payroll_rules_fixed_rate_note)
    }
}

@Composable
private fun RulesCard(title: Int, help: Int, content: @Composable () -> Unit) {
    AppCard(Modifier.fillMaxWidth(), verticalSpacing = 10.dp) {
        SectionHeader(stringResource(title), subtitle = stringResource(help))
        content()
    }
}

@Composable
private fun Segments(labels: List<String>, selected: Int, enabled: Boolean, onSelect: (Int) -> Unit) {
    SegmentedChoice(labels, selected, onSelect = { if (enabled) onSelect(it) })
}

@Composable
private fun Label(text: Int) = Text(stringResource(text), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)

@Composable
private fun Hint(text: Int) = Text(stringResource(text), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
