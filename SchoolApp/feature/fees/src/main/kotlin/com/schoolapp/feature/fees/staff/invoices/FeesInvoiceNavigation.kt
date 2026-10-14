package com.schoolapp.feature.fees.staff.invoices

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.InvoiceDetailDestination
import com.schoolapp.feature.fees.staff.invoices.create.NewInvoiceRoute
import kotlinx.serialization.Serializable

/** Staff: a one-off draft invoice; fee heads come from [schoolId]. */
@Serializable
internal data class NewInvoiceDestination(val schoolId: String?)

fun NavGraphBuilder.feesInvoiceDestinations(navController: NavHostController) {
    composable<NewInvoiceDestination> {
        NewInvoiceRoute(
            onBack = navController::popBackStack,
            onCreated = { id ->
                navController.popBackStack()
                navController.navigate(InvoiceDetailDestination(id))
            },
        )
    }
}
