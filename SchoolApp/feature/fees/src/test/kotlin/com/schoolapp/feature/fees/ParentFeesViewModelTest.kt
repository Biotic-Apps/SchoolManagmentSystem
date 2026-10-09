package com.schoolapp.feature.fees

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.InvoicePdfDownloader
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.fees.invoice.InvoiceDetailViewModel
import com.schoolapp.feature.fees.invoice.ReceiptProblem
import com.schoolapp.feature.fees.parent.ParentFeesViewModel
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ParentFeesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeFeesRepository().apply {
        summaries = mapOf("c1" to FeesFixtures.summary(850_000), "c2" to FeesFixtures.summary(1_200_000))
        invoicesByStudent = mapOf(
            "c1" to listOf(FeesFixtures.invoice("i1", "c1")),
            "c2" to listOf(FeesFixtures.invoice("i2", "c2"), FeesFixtures.invoice("i3", "c2", balance = 0)),
        )
    }

    @Test
    fun loads_active_child_and_reloads_on_child_switch() = runTest {
        val auth = FakeAuthRepository(FeesFixtures.parentSession("c1"))
        val vm = ParentFeesViewModel(auth, repository)
        assertEquals("c1", vm.uiState.value.childId)
        assertEquals(850_000L, vm.uiState.value.summary?.totalDueMinor)
        assertEquals(listOf("i1"), vm.uiState.value.invoices.map { it.id })

        auth.selectChild("c2")
        val state = vm.uiState.value
        assertEquals("c2", state.childId)
        assertEquals("Omar Khan", state.childName)
        assertEquals(1_200_000L, state.summary?.totalDueMinor)
        assertEquals(listOf("i2", "i3"), state.invoices.map { it.id })
        assertEquals(listOf("c1", "c2"), repository.summaryCalls)
        assertEquals(listOf<String?>("c1", "c2"), repository.invoiceCalls)
    }

    @Test
    fun pay_online_is_hidden_when_gateway_disabled() {
        val vm = invoiceViewModel(online = false)
        val state = vm.uiState.value
        assertFalse(state.canPayOnline)
        assertTrue(state.canUploadProof)
        vm.payOnline()
        assertFalse(vm.uiState.value.isPayingOnline)
        assertNull(vm.uiState.value.urlToOpen)
    }

    @Test
    fun pay_online_shows_when_gateway_enabled_and_opens_redirect() {
        repository.payOnlineResult = AppResult.Success("https://pay.example/redirect")
        val vm = invoiceViewModel(online = true)
        assertTrue(vm.uiState.value.canPayOnline)
        vm.payOnline()
        assertEquals("https://pay.example/redirect", vm.uiState.value.urlToOpen)
        vm.onUrlOpened()
        assertNull(vm.uiState.value.urlToOpen)
    }

    @Test
    fun paid_invoice_offers_no_payment_actions_and_receipt_not_ready_is_reported() {
        repository.summaries = mapOf("c2" to FeesFixtures.summary(online = true))
        val vm = InvoiceDetailViewModel(SavedStateHandle(mapOf("invoiceId" to "i3")), repository, InvoicePdfDownloader(repository))
        assertFalse(vm.uiState.value.canPayOnline)
        assertFalse(vm.uiState.value.canUploadProof)
        vm.openReceipt("pay-1")
        assertEquals(ReceiptProblem.NotReady, vm.uiState.value.receiptProblem)
    }

    private fun invoiceViewModel(online: Boolean): InvoiceDetailViewModel {
        repository.summaries = mapOf("c1" to FeesFixtures.summary(online = online))
        return InvoiceDetailViewModel(SavedStateHandle(mapOf("invoiceId" to "i1")), repository, InvoicePdfDownloader(repository))
    }
}
