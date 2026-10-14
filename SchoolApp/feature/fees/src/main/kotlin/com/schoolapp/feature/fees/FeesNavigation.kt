package com.schoolapp.feature.fees

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.InvoiceDetailDestination
import com.schoolapp.feature.fees.invoice.InvoiceDetailRoute
import com.schoolapp.feature.fees.proof.ProofUploadRoute
import com.schoolapp.feature.fees.record.RecordPaymentRoute
import com.schoolapp.feature.fees.staff.invoices.feesInvoiceDestinations
import com.schoolapp.feature.fees.staff.ledger.feesLedgerDestinations
import com.schoolapp.feature.fees.staff.structure.feesStructureDestinations
import kotlinx.serialization.Serializable

/** Parent: upload a bank/wallet payment proof against [invoiceId]. */
@Serializable
internal data class ProofUploadDestination(val invoiceId: String)

/** Cashier/accountant: record a counter payment. */
@Serializable
internal data object RecordPaymentDestination

fun NavGraphBuilder.feesDestinations(navController: NavHostController) {
    composable<InvoiceDetailDestination> {
        InvoiceDetailRoute(
            onBack = navController::popBackStack,
            onUploadProof = { navController.navigate(ProofUploadDestination(it)) },
        )
    }
    composable<ProofUploadDestination> { ProofUploadRoute(onBack = navController::popBackStack) }
    composable<RecordPaymentDestination> { RecordPaymentRoute(onBack = navController::popBackStack) }
    feesInvoiceDestinations(navController)
    feesLedgerDestinations(navController)
    feesStructureDestinations(navController)
}
