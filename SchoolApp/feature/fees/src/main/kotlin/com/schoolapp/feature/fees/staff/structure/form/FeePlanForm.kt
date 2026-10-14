package com.schoolapp.feature.fees.staff.structure.form

import androidx.compose.runtime.Immutable
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.structure.FeeFrequency
import com.schoolapp.core.model.fees.structure.FeePlan
import com.schoolapp.core.model.fees.structure.FeePlanItem
import com.schoolapp.core.model.fees.structure.LateFee

@Immutable
data class PlanItemRow(
    val key: Int,
    val feeHeadId: String? = null,
    val amount: String = "",
    val frequency: FeeFrequency = FeeFrequency.MONTHLY,
    val dueDay: Int = DEFAULT_DUE_DAY,
)

enum class ItemIssue { HEAD_REQUIRED, HEAD_DUPLICATE, AMOUNT }

@Immutable
data class PlanIssues(
    val classRequired: Boolean = false,
    val name: Boolean = false,
    val noItems: Boolean = false,
    val items: Map<Int, Set<ItemIssue>> = emptyMap(),
    val lateAmount: Boolean = false,
) {
    val isEmpty: Boolean get() = !classRequired && !name && !noItems && items.isEmpty() && !lateAmount
}

@Immutable
data class FeePlanForm(
    val classId: String? = null,
    val name: String = "",
    val items: List<PlanItemRow> = listOf(PlanItemRow(0)),
    val nextKey: Int = 1,
    val lateFee: Boolean = false,
    val lateAmount: String = "",
    val lateDays: Int = DEFAULT_LATE_DAYS,
    val issues: PlanIssues = PlanIssues(),
    val showIssues: Boolean = false,
) {
    fun validate(): PlanIssues {
        val itemIssues = items.mapNotNull { row ->
            val problems = buildSet {
                when {
                    row.feeHeadId == null -> add(ItemIssue.HEAD_REQUIRED)
                    items.count { it.feeHeadId == row.feeHeadId } > 1 -> add(ItemIssue.HEAD_DUPLICATE)
                }
                if ((MoneyFormat.parse(row.amount) ?: -1L) < 0L) add(ItemIssue.AMOUNT)
            }
            problems.takeIf { it.isNotEmpty() }?.let { row.key to it }
        }.toMap()
        return PlanIssues(
            classRequired = classId == null,
            name = name.trim().length !in 2..100,
            noItems = items.isEmpty(),
            items = itemIssues,
            lateAmount = lateFee && (MoneyFormat.parse(lateAmount) ?: 0L) <= 0L,
        )
    }

    fun planItems(): List<FeePlanItem> = items.map {
        FeePlanItem(it.feeHeadId.orEmpty(), "", MoneyFormat.parse(it.amount) ?: 0L, it.frequency, it.dueDay)
    }

    fun late(): LateFee? = if (lateFee) LateFee(MoneyFormat.parse(lateAmount) ?: 0L, lateDays) else null

    companion object {
        fun from(plan: FeePlan): FeePlanForm {
            val rows = plan.items.mapIndexed { index, item ->
                PlanItemRow(index, item.feeHeadId, MoneyFormat.toInput(item.amountMinor), item.frequency, item.dueDay)
            }
            return FeePlanForm(
                classId = plan.classId,
                name = plan.name,
                items = rows,
                nextKey = rows.size,
                lateFee = plan.lateFee != null,
                lateAmount = plan.lateFee?.let { MoneyFormat.toInput(it.amountMinor) }.orEmpty(),
                lateDays = plan.lateFee?.afterDays ?: DEFAULT_LATE_DAYS,
            )
        }
    }
}

const val DEFAULT_DUE_DAY = 10
const val DEFAULT_LATE_DAYS = 7
