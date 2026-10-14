package com.schoolapp.feature.accounts.income.form

import com.schoolapp.core.designsystem.money.MoneyFormat

/** Web / API rules: title 2–150, category and date required, amount above zero, description ≤ 500, notes ≤ 1000. */
internal object IncomeFormValidation {
    const val MIN_TITLE = 2
    const val MAX_TITLE = 150
    const val MAX_DESCRIPTION = 500
    const val MAX_NOTES = 1000

    fun validate(state: IncomeFormUiState): Map<IncomeField, IncomeProblem> = buildMap {
        val title = state.title.trim()
        when {
            title.isEmpty() -> put(IncomeField.TITLE, IncomeProblem.REQUIRED)
            title.length < MIN_TITLE -> put(IncomeField.TITLE, IncomeProblem.TOO_SHORT)
            title.length > MAX_TITLE -> put(IncomeField.TITLE, IncomeProblem.TOO_LONG)
        }
        if (state.categoryId == null) put(IncomeField.CATEGORY, IncomeProblem.REQUIRED)
        val amount = state.amount.trim()
        when {
            amount.isEmpty() -> put(IncomeField.AMOUNT, IncomeProblem.REQUIRED)
            (MoneyFormat.parse(amount) ?: 0L) <= 0L -> put(IncomeField.AMOUNT, IncomeProblem.INVALID)
        }
        if (state.receivedOn.isBlank()) put(IncomeField.DATE, IncomeProblem.REQUIRED)
        if (state.description.trim().length > MAX_DESCRIPTION) put(IncomeField.DESCRIPTION, IncomeProblem.TOO_LONG)
        if (state.notes.trim().length > MAX_NOTES) put(IncomeField.NOTES, IncomeProblem.TOO_LONG)
    }
}
