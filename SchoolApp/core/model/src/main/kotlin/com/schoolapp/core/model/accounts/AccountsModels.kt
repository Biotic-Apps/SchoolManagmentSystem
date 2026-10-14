package com.schoolapp.core.model.accounts

/** School-wide category for non-fee income (donations, rent, event fees...). */
data class IncomeCategory(val id: String, val name: String, val code: String?)

/** One "other income" record of a branch; [receivedOn] is `YYYY-MM-DD`. */
data class Income(
    val id: String,
    val branchId: String?,
    val category: IncomeCategory?,
    val title: String,
    val description: String?,
    val amountMinor: Long,
    val currency: String,
    val receivedOn: String,
    val receiptFileId: String?,
    val receiptUrl: String?,
    val notes: String?,
    val createdAt: String?,
)

/** Create/update body; blank optional text is sent as null on create. */
data class IncomeInput(
    val categoryId: String,
    val title: String,
    val description: String?,
    val amountMinor: Long,
    val receivedOn: String,
    val receiptFileId: String?,
    val notes: String?,
)

/** Income list filters (all optional); dates are `YYYY-MM-DD`, inclusive. */
data class IncomeFilter(val categoryId: String? = null, val from: String? = null, val to: String? = null) {
    val isActive: Boolean get() = categoryId != null || from != null || to != null
}

/** One page of the income list plus the server total for "load more". */
data class IncomePage(val items: List<Income>, val page: Int, val total: Int?) {
    fun hasMoreAfter(loaded: Int): Boolean = total != null && loaded < total
}

enum class ProfitLossSection { INCOME, EXPENSE }

data class ProfitLossLine(val section: ProfitLossSection, val item: String, val amountMinor: Long)

/** Branch profit & loss for an inclusive date range: fees + other income vs expenses + payroll. */
data class ProfitLoss(
    val from: String,
    val to: String,
    val totalIncomeMinor: Long,
    val totalExpensesMinor: Long,
    val netMinor: Long,
    val lines: List<ProfitLossLine>,
) {
    val incomeLines: List<ProfitLossLine> get() = lines.filter { it.section == ProfitLossSection.INCOME }
    val expenseLines: List<ProfitLossLine> get() = lines.filter { it.section == ProfitLossSection.EXPENSE }
}
