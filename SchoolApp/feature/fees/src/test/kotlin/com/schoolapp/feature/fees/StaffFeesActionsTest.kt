package com.schoolapp.feature.fees

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.core.model.fees.DuesRow
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.fees.staff.dues.DuesViewModel
import com.schoolapp.feature.fees.staff.payments.ActionIssue
import com.schoolapp.feature.fees.staff.payments.PaymentAction
import com.schoolapp.feature.fees.staff.payments.PaymentActionsViewModel
import com.schoolapp.feature.fees.staff.payments.PaymentNotice
import com.schoolapp.feature.fees.staff.today.TodayViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class StaffFeesActionsTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeFeesRepository()
    private val clock = AppClock { LocalDateTime.of(2026, 10, 8, 16, 0) }

    private fun auth(vararg permissions: String) = FakeAuthRepository(TestSessions.session(RoleKey.ACCOUNTANT, *permissions))

    private fun row(id: String) = DuesRow(id, "Student $id", null, "Class 5", "A", 1_000, 10, null)

    @Test
    fun reminders_need_fees_edit_and_send_the_selected_students_after_confirmation() {
        repository.duesRows = listOf(row("s1"), row("s2"))
        val viewOnly = DuesViewModel(auth("fees.view"), repository)
        viewOnly.toggle("s1")
        assertFalse(viewOnly.uiState.value.canRemind)
        assertTrue(viewOnly.uiState.value.selected.isEmpty())

        val vm = DuesViewModel(auth("fees.view", "fees.edit"), repository)
        vm.toggleAll()
        assertTrue(vm.uiState.value.allSelected)
        vm.toggle("s2")
        vm.askToSendReminders()
        assertTrue(vm.uiState.value.confirmingReminders)
        assertTrue(repository.reminderCalls.isEmpty())
        vm.sendReminders()
        assertEquals(listOf(listOf("s1")), repository.reminderCalls)
        assertEquals(1, vm.uiState.value.remindersSent)
        assertTrue(vm.uiState.value.selected.isEmpty())
    }

    @Test
    fun reminder_failure_keeps_the_selection_and_shows_the_error() {
        repository.duesRows = listOf(row("s1"))
        repository.actionResult = AppResult.Failure(AppError.Network)
        val vm = DuesViewModel(auth("fees.edit"), repository)
        vm.toggle("s1")
        vm.askToSendReminders()
        vm.sendReminders()
        assertEquals(setOf("s1"), vm.uiState.value.selected)
        assertEquals(AppError.Network, vm.uiState.value.actionError)
    }

    @Test
    fun reverse_needs_fees_edit_a_reason_and_confirmation() {
        val payment = FeesFixtures.payment("RCT-1", 500_000)
        val refundOnly = PaymentActionsViewModel(auth("fees.add"), repository)
        refundOnly.open(payment)
        refundOnly.choose(PaymentAction.REVERSE)
        assertNull(refundOnly.uiState.value.sheet?.action)

        val vm = PaymentActionsViewModel(auth("fees.edit"), repository)
        vm.open(payment)
        vm.choose(PaymentAction.REVERSE)
        vm.onReasonChange("no")
        vm.submit()
        assertEquals(setOf(ActionIssue.REASON_TOO_SHORT), vm.uiState.value.sheet?.issues)
        vm.onReasonChange("Entered twice")
        vm.submit()
        assertTrue(vm.uiState.value.sheet!!.confirming)
        assertTrue(repository.reverseCalls.isEmpty())
        vm.confirm()
        assertEquals(listOf("p1" to "Entered twice"), repository.reverseCalls)
        assertNull(vm.uiState.value.sheet)
        assertEquals(PaymentNotice.REVERSAL_SENT, vm.uiState.value.notice)
        assertEquals(1, vm.changes.value)
    }

    @Test
    fun refund_is_capped_at_the_payment_and_uses_the_chosen_method() {
        val vm = PaymentActionsViewModel(auth("fees.add"), repository)
        vm.open(FeesFixtures.payment("RCT-1", 500_000))
        vm.choose(PaymentAction.REFUND)
        assertEquals("5000", vm.uiState.value.sheet?.amount)
        vm.onAmountChange("6000")
        vm.onReasonChange("Left school")
        vm.submit()
        assertEquals(setOf(ActionIssue.AMOUNT_OVER_PAYMENT), vm.uiState.value.sheet?.issues)
        vm.onAmountChange("2,000")
        vm.onMethodChange(PaymentMethod.BANK)
        vm.submit()
        vm.confirm()
        val refund = repository.refundCalls.single()
        assertEquals(200_000L, refund.amountMinor)
        assertEquals(PaymentMethod.BANK, refund.method)
        assertEquals(PaymentNotice.REFUND_SENT, vm.uiState.value.notice)
    }

    @Test
    fun reversed_payments_offer_no_money_actions() {
        val vm = PaymentActionsViewModel(auth("fees.add", "fees.edit"), repository)
        val reversed = FeesFixtures.payment("RCT-1", 500_000).copy(status = "REVERSED")
        assertFalse(vm.uiState.value.canAct(reversed))
        vm.open(reversed)
        vm.choose(PaymentAction.REFUND)
        assertNull(vm.uiState.value.sheet?.action)
    }

    @Test
    fun close_day_needs_fees_approve_and_confirms_the_counted_cash() {
        repository.collection = DailyCollection("2026-10-08", 300_000, emptyList(), emptyList(), emptyList(), cashMinor = 200_000)
        val noApprove = TodayViewModel(auth("fees.view", "fees.add"), repository, clock)
        assertFalse(noApprove.uiState.value.showCloseDay)

        val vm = TodayViewModel(auth("fees.view", "fees.approve"), repository, clock)
        assertTrue(vm.uiState.value.showCloseDay)
        vm.openCloseDay()
        vm.onCashChange("abc")
        vm.submitCloseDay()
        assertTrue(vm.uiState.value.closeForm!!.cashInvalid)
        vm.onCashChange("1,950")
        vm.onNoteChange("Short 50")
        vm.submitCloseDay()
        assertTrue(vm.uiState.value.closeForm!!.confirming)
        vm.confirmCloseDay()
        assertEquals(listOf(Triple("2026-10-08", 195_000L, "Short 50")), repository.closeCalls)
        assertNull(vm.uiState.value.closeForm)
        assertTrue(vm.uiState.value.collection!!.closed)
        assertFalse(vm.uiState.value.showCloseDay)
    }
}
