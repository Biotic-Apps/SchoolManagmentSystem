package com.schoolapp.feature.approvals

import androidx.lifecycle.SavedStateHandle
import app.cash.turbine.test
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.approvals.detail.ApprovalDetailViewModel
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ApprovalDetailViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val leave = ApprovalRequest(
        "r1", "LEAVE", "LeaveRequest", "Leave request", "u2", "Bilal Ahmed", ApprovalStatus.PENDING, 1, null,
    )
    private val repository = FakeApprovalsRepository(listOf(leave, leave.copy(id = "own", requestedById = "u1")))
    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "approvals.view", "approvals.approve"))

    private fun viewModel(id: String = "r1") = ApprovalDetailViewModel(SavedStateHandle(mapOf("id" to id)), repository, auth)

    @Test
    fun pending_request_from_someone_else_can_be_decided() {
        val state = viewModel().uiState.value
        assertEquals(leave, state.request)
        assertTrue(state.showActions)
    }

    @Test
    fun own_request_or_missing_permission_hides_actions() {
        assertFalse(viewModel("own").uiState.value.showActions)
        auth.sessionState.value = TestSessions.session(RoleKey.PRINCIPAL, "approvals.view")
        assertFalse(viewModel().uiState.value.showActions)
    }

    @Test
    fun reject_and_return_require_a_comment() {
        val vm = viewModel()
        vm.onDecide(ApprovalDecision.REJECTED)
        assertTrue(vm.uiState.value.commentRequired)
        vm.onDecide(ApprovalDecision.RETURNED)
        assertTrue(repository.decisions.isEmpty())
        vm.onCommentChange("Please attach the medical note")
        assertFalse(vm.uiState.value.commentRequired)
    }

    @Test
    fun approve_shows_progress_then_records_decision() = runTest {
        val gate = CompletableDeferred<Unit>()
        repository.decideGate = gate
        val vm = viewModel()
        vm.uiState.test {
            assertTrue(awaitItem().showActions)
            vm.onDecide(ApprovalDecision.APPROVED)
            assertEquals(ApprovalDecision.APPROVED, awaitItem().busyDecision)
            gate.complete(Unit)
            val decided = expectMostRecentItem()
            assertNull(decided.busyDecision)
            assertEquals(ApprovalDecision.APPROVED, decided.decided)
            assertEquals(ApprovalStatus.APPROVED, decided.request?.status)
            assertFalse(decided.showActions)
        }
        assertEquals(listOf(Triple("r1", ApprovalDecision.APPROVED, "")), repository.decisions)
    }

    @Test
    fun reject_with_comment_is_sent() {
        val vm = viewModel()
        vm.onCommentChange("Dates overlap exams")
        vm.onDecide(ApprovalDecision.REJECTED)
        assertEquals(Triple("r1", ApprovalDecision.REJECTED, "Dates overlap exams"), repository.decisions.single())
        assertEquals(ApprovalDecision.REJECTED, vm.uiState.value.decided)
    }

    @Test
    fun failed_decision_keeps_actions_and_shows_error() {
        repository.decideError = AppError.Server(423, "RECORD_LOCKED", "Locked")
        val vm = viewModel()
        vm.onDecide(ApprovalDecision.APPROVED)
        val state = vm.uiState.value
        assertEquals(AppError.Server(423, "RECORD_LOCKED", "Locked"), state.decideError)
        assertTrue(state.showActions)
        assertNull(state.decided)
    }
}
