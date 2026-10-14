package com.schoolapp.feature.expenses

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.expenses.menu.ExpensesMenuRoute

/** Menu `expenses` (Expenses & Vendors): branch bills, vendors and expense categories. */
@Composable
fun ExpensesMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    ExpensesMenuRoute(roleKey = role.key, onOpen = onOpen, modifier = modifier)
}
