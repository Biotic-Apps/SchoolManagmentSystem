package com.schoolapp.feature.expenses

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.feature.expenses.detail.ExpenseDetailRoute
import com.schoolapp.feature.expenses.form.ExpenseFormRoute
import kotlinx.serialization.Serializable

/** One bill: summary, payments, submit, record payment, bill copy. [schoolId] scopes the edit form; [created] shows "saved". */
@Serializable
internal data class ExpenseDetailDestination(val expenseId: String, val schoolId: String? = null, val created: Boolean = false)

/** Add (no [expenseId]) or edit a draft/rejected bill of [branchId]. */
@Serializable
internal data class ExpenseFormDestination(
    val branchId: String,
    val schoolId: String? = null,
    val expenseId: String? = null,
)

/** Detail screens opened from the expenses menu screen(s). */
fun NavGraphBuilder.expensesDestinations(navController: NavHostController) {
    composable<ExpenseDetailDestination> {
        ExpenseDetailRoute(
            onBack = navController::popBackStack,
            onEdit = { navController.navigate(it) },
        )
    }
    composable<ExpenseFormDestination> {
        ExpenseFormRoute(
            onBack = navController::popBackStack,
            onCreated = { id, schoolId ->
                navController.popBackStack()
                navController.navigate(ExpenseDetailDestination(id, schoolId, created = true))
            },
            onUpdated = {
                navController.previousBackStackEntry?.savedStateHandle?.set(UPDATED_KEY, true)
                navController.popBackStack()
            },
        )
    }
}

/** Set on the detail entry when the edit form saved, so it reloads and says so. */
internal const val UPDATED_KEY = "expenses_updated"
