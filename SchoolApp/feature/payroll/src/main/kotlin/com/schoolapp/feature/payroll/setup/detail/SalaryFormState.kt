package com.schoolapp.feature.payroll.setup.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.payroll.setup.SalaryItem
import com.schoolapp.core.model.payroll.setup.SalaryStructure
import com.schoolapp.core.model.payroll.setup.SalaryStructureInput
import java.time.YearMonth

/** One editable allowance / deduction row; [key] keeps list identity while rows are added and removed. */
@Immutable
data class ItemRow(val key: Int, val name: String = "", val amount: String = "")

enum class ItemProblem { NAME_REQUIRED, NAME_TOO_LONG, AMOUNT_INVALID }

/** Field problems of the salary form; rows are addressed by their [ItemRow.key]. */
@Immutable
data class SalaryFormIssues(
    val basic: Boolean = false,
    val overtime: Boolean = false,
    val items: Map<Int, Set<ItemProblem>> = emptyMap(),
) {
    val isEmpty: Boolean get() = !basic && !overtime && items.isEmpty()
}

@Immutable
data class SalaryForm(
    val month: YearMonth,
    val basic: String = "",
    val allowances: List<ItemRow> = emptyList(),
    val deductions: List<ItemRow> = emptyList(),
    val overtimeRate: String = "",
    val reason: String = "",
    val nextKey: Int = 0,
    val issues: SalaryFormIssues = SalaryFormIssues(),
    val showIssues: Boolean = false,
) {
    fun validate(): SalaryFormIssues {
        val basicMinor = MoneyFormat.parse(basic)
        val rate = overtimeRate.trim()
        val items = (allowances + deductions).mapNotNull { row ->
            val problems = buildSet {
                when {
                    row.name.isBlank() -> add(ItemProblem.NAME_REQUIRED)
                    row.name.trim().length > MAX_NAME -> add(ItemProblem.NAME_TOO_LONG)
                }
                if ((MoneyFormat.parse(row.amount) ?: 0L) <= 0L) add(ItemProblem.AMOUNT_INVALID)
            }
            problems.takeIf { it.isNotEmpty() }?.let { row.key to it }
        }.toMap()
        return SalaryFormIssues(
            basic = basicMinor == null || basicMinor <= 0L,
            overtime = rate.isNotEmpty() && (MoneyFormat.parse(rate) ?: 0L) <= 0L,
            items = items,
        )
    }

    fun toInput(): SalaryStructureInput = SalaryStructureInput(
        effectiveFrom = month.toString(),
        basicMinor = MoneyFormat.parse(basic) ?: 0L,
        allowances = allowances.map { SalaryItem(it.name.trim(), MoneyFormat.parse(it.amount) ?: 0L) },
        deductions = deductions.map { SalaryItem(it.name.trim(), MoneyFormat.parse(it.amount) ?: 0L) },
        overtimeRateMinor = overtimeRate.trim().takeIf { it.isNotEmpty() }?.let(MoneyFormat::parse)?.takeIf { it > 0 },
        reason = reason.trim().takeIf { it.isNotEmpty() },
    )

    companion object {
        const val MAX_NAME = 60

        /** Pre-filled from the current structure (a change), or empty (first salary). */
        fun from(current: SalaryStructure?, month: YearMonth): SalaryForm {
            if (current == null) return SalaryForm(month)
            var key = 0
            fun rows(items: List<SalaryItem>) = items.map { ItemRow(key++, it.name, MoneyFormat.toInput(it.amountMinor)) }
            val allowances = rows(current.allowances)
            val deductions = rows(current.deductions)
            return SalaryForm(
                month = month,
                basic = MoneyFormat.toInput(current.basicMinor),
                allowances = allowances,
                deductions = deductions,
                overtimeRate = current.overtimeRateMinor?.let(MoneyFormat::toInput).orEmpty(),
                nextKey = key,
            )
        }
    }
}
