package com.schoolapp.feature.payroll

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.model.payroll.SalaryPaymentMethod
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.payroll.runs.MonthlyPayrollViewModel
import com.schoolapp.feature.payroll.runs.RunConfirm
import com.schoolapp.feature.payroll.runs.RunNotice
import com.schoolapp.feature.payroll.runs.payment.PaymentIssue
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime
import java.time.YearMonth

class MonthlyPayrollViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 14, 9, 0) }
    private val repository = FakePayrollRepository()

    private fun session(vararg permissions: String) = TestSessions.session(RoleKey.PRINCIPAL, "payroll.view", *permissions)

    private fun viewModel(vararg permissions: String, runId: String? = null): MonthlyPayrollViewModel {
        val handle = SavedStateHandle(runId?.let { mapOf("runId" to it) } ?: emptyMap())
        val vm = MonthlyPayrollViewModel(handle, repository, FakeAuthRepository(session(*permissions)), clock)
        if (runId == null) vm.bind("b1", session(*permissions))
        return vm
    }

    @Test
    fun empty_month_offers_create_only_with_payroll_add_and_never_goes_past_this_month() {
        val viewer = viewModel()
        assertNull(viewer.uiState.value.run)
        assertFalse(viewer.uiState.value.permissions.canAdd)
        assertFalse(viewer.uiState.value.canGoNext)
        viewer.onNextMonth()
        assertEquals(YearMonth.of(2026, 10), viewer.uiState.value.month)

        val adder = viewModel("payroll.add")
        adder.createRun()
        assertEquals(listOf("b1" to "2026-10"), repository.createCalls)
        assertEquals(RunNotice.CREATED, adder.uiState.value.notice)
        assertEquals(PayrollRunStatus.DRAFT, adder.uiState.value.run?.status)
    }

    @Test
    fun conflict_on_create_reloads_with_info_notice() {
        repository.createError = AppError.Server(409, "CONFLICT", "exists")
        val vm = viewModel("payroll.add")
        vm.createRun()
        assertEquals(RunNotice.ALREADY_EXISTS, vm.uiState.value.notice)
        assertNull(vm.uiState.value.actionError)
    }

    @Test
    fun calculate_waits_for_the_job_then_review_is_offered() {
        repository.runs = mutableListOf(run("r1", "2026-10", PayrollRunStatus.DRAFT))
        val vm = viewModel("payroll.edit")
        assertTrue(vm.uiState.value.canCalculate)
        assertTrue(vm.uiState.value.calculateIsFirst)
        assertFalse(vm.uiState.value.canReview)
        vm.actions.calculate()
        assertEquals(listOf("calculate:r1", "await:job-1"), repository.calls)
        assertEquals(RunNotice.CALCULATED, vm.uiState.value.notice)
        assertFalse(vm.uiState.value.calculating)
        assertTrue(vm.uiState.value.canReview)
        assertFalse(vm.uiState.value.canSendForApproval)
    }

    @Test
    fun approver_confirms_send_and_run_then_waits() {
        repository.runs = mutableListOf(run("r1", "2026-10", PayrollRunStatus.REVIEWED))
        val vm = viewModel("payroll.approve")
        assertFalse(vm.uiState.value.canCalculate)
        vm.actions.askSendForApproval()
        assertEquals(RunConfirm.APPROVE, vm.uiState.value.confirm)
        vm.actions.confirm()
        assertEquals(listOf("r1"), repository.approvalCalls)
        assertTrue(vm.uiState.value.awaitingApproval)
        assertFalse(vm.uiState.value.canSendForApproval)
    }

    @Test
    fun close_needs_every_line_paid() {
        val unpaid = run("r1", "2026-10", PayrollRunStatus.PARTIALLY_PAID).copy(lines = listOf(line("s1", "TEACHER", 100), line("s2", "HELPER", 50, 50)))
        repository.runs = mutableListOf(unpaid)
        val vm = viewModel("payroll.approve", "payroll.edit")
        assertTrue(vm.uiState.value.canClose)
        assertFalse(vm.uiState.value.closeEnabled)
        vm.actions.askClose()
        assertNull(vm.uiState.value.confirm)
        assertEquals(listOf("TEACHER", "HELPER"), vm.uiState.value.staffTypes)
        vm.onStaffType("HELPER")
        assertEquals(1, vm.uiState.value.lines.size)
        assertEquals(0L, vm.uiState.value.totals.balanceMinor)
    }

    @Test
    fun payment_is_validated_against_the_balance_then_recorded() {
        val approved = run("r1", "2026-10", PayrollRunStatus.APPROVED).copy(lines = listOf(line("s1", "TEACHER", 10_000)))
        repository.runs = mutableListOf(approved)
        val vm = viewModel("payroll.edit")
        vm.payment.open("s1")
        assertEquals("100", vm.uiState.value.payment?.amount)
        vm.payment.onAmount("150")
        vm.payment.submit()
        assertTrue(PaymentIssue.AMOUNT_OVER_BALANCE in vm.payment.issues())
        assertTrue(PaymentIssue.METHOD_REQUIRED in vm.payment.issues())
        vm.payment.onAmount("40")
        vm.payment.onMethod(SalaryPaymentMethod.BANK)
        vm.payment.submit()
        assertNull(vm.uiState.value.payment)
        assertEquals(RunNotice.PAID, vm.uiState.value.notice)
        val (runId, input) = repository.payments.single()
        assertEquals("r1", runId)
        assertEquals(4_000L, input.amountMinor)
        assertEquals("2026-10-14", input.paidOn)
    }

    @Test
    fun opened_from_a_link_shows_that_run_with_session_permissions() {
        repository.runs = mutableListOf(run("r9", "2026-08", PayrollRunStatus.CALCULATED).copy(lines = listOf(line("s1", "TEACHER", 100))))
        val vm = viewModel("payroll.edit", runId = "r9")
        assertTrue(vm.uiState.value.fixedRun)
        assertEquals("r9", vm.uiState.value.run?.id)
        assertEquals(YearMonth.of(2026, 8), vm.uiState.value.month)
        assertTrue(vm.uiState.value.canReview)
        vm.actions.printAll()
        assertEquals("content://pdfs/payslips-2026-08.pdf", vm.uiState.value.pdfToOpen)
    }
}
