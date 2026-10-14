package com.schoolapp.feature.accounts.common

import com.schoolapp.core.model.SessionContext

/** `expenses.add` records income and adds categories; edit/delete of income needs `expenses.add` or `expenses.edit`. */
data class AccountsPermissions(val canAdd: Boolean = false, val canEdit: Boolean = false) {
    companion object {
        fun of(session: SessionContext): AccountsPermissions {
            val add = session.has("expenses.add")
            return AccountsPermissions(canAdd = add, canEdit = add || session.has("expenses.edit"))
        }
    }
}
