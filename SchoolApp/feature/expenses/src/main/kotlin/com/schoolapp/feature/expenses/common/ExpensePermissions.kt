package com.schoolapp.feature.expenses.common

import com.schoolapp.core.model.SessionContext

/** What the active role may do here; the API enforces the same keys. */
data class ExpensePermissions(
    /** Add expenses, vendors and categories (`expenses.add`). */
    val canAdd: Boolean = false,
    /** Edit a draft/rejected bill (`expenses.add` or `expenses.edit`). */
    val canEdit: Boolean = false,
    /** Send a bill for approval (`expenses.add` or `expenses.submit`). */
    val canSubmit: Boolean = false,
    /** Record a payment against an approved bill (`expenses.edit`). */
    val canPay: Boolean = false,
) {
    companion object {
        fun of(session: SessionContext?): ExpensePermissions {
            if (session == null) return ExpensePermissions()
            val add = session.has(ADD)
            val edit = session.has(EDIT)
            return ExpensePermissions(
                canAdd = add,
                canEdit = add || edit,
                canSubmit = add || session.has(SUBMIT),
                canPay = edit,
            )
        }

        private const val ADD = "expenses.add"
        private const val EDIT = "expenses.edit"
        private const val SUBMIT = "expenses.submit"
    }
}
