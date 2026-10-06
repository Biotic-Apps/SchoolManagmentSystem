package com.schoolapp.feature.payroll

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.payroll.run.PayrollRunViewModel
import com.schoolapp.feature.payroll.runs.PayrollRunsViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class PayrollRunsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakePayrollRepository().apply {
        runs = mutableListOf(
            run("r-08", "2026-08", PayrollRunStatus.CLOSED),
            run("r-10", "2026-10", PayrollRunStatus.REVIEWED),
            run("r-09", "2026-09", PayrollRunStatus.PAID),
        )
    }

    private fun viewModel(vararg permissions: String) =
        PayrollRunsViewModel(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "payroll.view", *permissions)), repository)

    @Test
    fun lists_branch_runs_newest_first() {
        val state = viewModel().uiState.value
        assertEquals(listOf<String?>("b1"), repository.runsCalls)
        assertEquals(listOf("2026-10", "2026-09", "2026-08"), state.runs.map { it.month })
        assertFalse(state.canSend(state.runs.first()))
    }

    @Test
    fun approver_sends_a_reviewed_run_and_it_then_waits_in_approvals() {
        val vm = viewModel("payroll.approve")
        val reviewed = vm.uiState.value.runs.first()
        assertTrue(vm.uiState.value.canSend(reviewed))
        assertFalse(vm.uiState.value.canSend(vm.uiState.value.runs[1]))

        vm.sendForApproval("r-10")
        val state = vm.uiState.value
        assertEquals(listOf("r-10"), repository.approvalCalls)
        assertEquals("r-10", state.sentRunId)
        assertNull(state.sendingId)
        val sent = state.runs.first()
        assertEquals("ap-r-10", sent.approvalId)
        assertFalse(state.canSend(sent))
        assertTrue(state.isWaiting(sent))
    }

    @Test
    fun failed_request_keeps_the_action() {
        repository.approvalError = AppError.Network
        val vm = viewModel("payroll.approve")
        vm.sendForApproval("r-10")
        assertEquals(AppError.Network, vm.uiState.value.actionError)
        assertNull(vm.uiState.value.sentRunId)
        assertTrue(vm.uiState.value.canSend(vm.uiState.value.runs.first()))
    }

    @Test
    fun run_detail_is_secure_and_shows_waiting_state() {
        repository.runs[1] = run("r-10", "2026-10", PayrollRunStatus.REVIEWED, approvalId = "ap-1")
        val vm = PayrollRunViewModel(SavedStateHandle(mapOf("runId" to "r-10")), repository)
        val state = vm.uiState.value
        assertTrue(state.secure)
        assertEquals("r-10", state.run?.id)
        assertTrue(state.isWaitingForApproval)
    }
}
