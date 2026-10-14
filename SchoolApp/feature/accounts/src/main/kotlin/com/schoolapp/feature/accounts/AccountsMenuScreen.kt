package com.schoolapp.feature.accounts

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.accounts.menu.AccountsMenuRoute

/** Menu `accounts` (Accounts): other income, income categories and branch profit & loss (`expenses.view`). */
@Composable
fun AccountsMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    AccountsMenuRoute(roleKey = role.key, modifier = modifier)
}
