package com.schoolapp.feature.fees

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.PaymentOutcome
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.fees.record.PaymentIssue
import com.schoolapp.feature.fees.record.RecordPaymentViewModel
import com.schoolapp.feature.fees.record.RecordResult
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class RecordPaymentViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeFeesRepository()
    private val ali = FeesFixtures.student("s1", "Ali Hassan")

    private fun viewModel() = RecordPaymentViewModel(
        repository,
        FakeStudentsRepository(listOf(ali)),
        AppClock { LocalDateTime.of(2026, 10, 6, 10, 0) },
    )

    private fun filled(vm: RecordPaymentViewModel) = vm.apply {
        onStudentSelected(ali)
        onAmountChange("8,500")
    }

    @Test
    fun defaults_to_cash_and_today() {
        val state = viewModel().uiState.value
        assertEquals(PaymentMethod.CASH, state.method)
        assertEquals("2026-10-06", state.receivedOn)
    }

    @Test
    fun validation_blocks_submit_and_reference_is_required_for_bank_and_cheque() {
        val vm = viewModel()
        vm.submit()
        assertEquals(setOf(PaymentIssue.STUDENT_REQUIRED, PaymentIssue.AMOUNT_REQUIRED), vm.uiState.value.issues)

        filled(vm)
        vm.onMethodChange(PaymentMethod.CHEQUE)
        vm.submit()
        assertEquals(setOf(PaymentIssue.REFERENCE_REQUIRED), vm.uiState.value.issues)

        vm.onReferenceChange("CHQ 001234")
        vm.onReceivedOnChange("2026-10-07")
        vm.submit()
        assertEquals(setOf(PaymentIssue.DATE_IN_FUTURE), vm.uiState.value.issues)
        assertTrue(repository.recordCalls.isEmpty())
    }

    @Test
    fun queued_outcome_shows_saved_on_device() {
        repository.recordResults = ArrayDeque(listOf(AppResult.Success(PaymentOutcome.Queued)))
        val vm = filled(viewModel())
        vm.submit()
        assertEquals(RecordResult.Queued, vm.uiState.value.result)
        assertNull(vm.uiState.value.pending)
        val (input, id) = repository.recordCalls.single()
        assertEquals(850_000L, input.amountMinor)
        assertEquals(PaymentMethod.CASH, input.method)
        assertNull(input.reference)
        assertTrue(id.isNotBlank())
    }

    @Test
    fun retry_of_identical_input_reuses_client_request_id_and_changed_input_gets_a_new_one() {
        repository.recordResults = ArrayDeque(
            listOf(
                AppResult.Failure(AppError.Server(500, null, null)),
                AppResult.Failure(AppError.Server(500, null, null)),
                AppResult.Failure(AppError.Server(500, null, null)),
            ),
        )
        val vm = filled(viewModel())
        vm.submit()
        vm.submit()
        assertEquals(repository.recordCalls[0].second, repository.recordCalls[1].second)

        vm.onAmountChange("9,000")
        vm.submit()
        assertNotEquals(repository.recordCalls[1].second, repository.recordCalls[2].second)
        assertEquals(900_000L, repository.recordCalls[2].first.amountMinor)
    }

    @Test
    fun recorded_outcome_shows_receipt_and_day_closed_error_is_kept() {
        repository.recordResults = ArrayDeque(
            listOf(
                AppResult.Failure(AppError.Server(423, "DAY_CLOSED", "Day closed")),
                AppResult.Success(PaymentOutcome.Recorded(FeesFixtures.payment("RCT-MAIN-2026-0042", 850_000))),
            ),
        )
        val vm = filled(viewModel())
        vm.submit()
        assertEquals(AppError.Server(423, "DAY_CLOSED", "Day closed"), vm.uiState.value.error)
        assertNull(vm.uiState.value.result)

        vm.onReceivedOnChange("2026-10-06")
        vm.submit()
        val result = vm.uiState.value.result as RecordResult.Recorded
        assertEquals("RCT-MAIN-2026-0042", result.receiptNo)

        vm.recordAnother()
        assertNull(vm.uiState.value.result)
        assertNull(vm.uiState.value.student)
    }
}
