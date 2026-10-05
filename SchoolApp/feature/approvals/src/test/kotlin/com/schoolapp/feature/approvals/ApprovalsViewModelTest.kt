package com.schoolapp.feature.approvals

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.testing.MainDispatcherRule
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class ApprovalsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val pending = ApprovalRequest("r1", "LEAVE", null, "Leave", "u2", "Bilal", ApprovalStatus.PENDING, 1, null)
    private val repository = FakeApprovalsRepository(
        listOf(pending, pending.copy(id = "r2", status = ApprovalStatus.APPROVED)),
    )

    @Test
    fun inbox_starts_on_pending_and_filters_by_status() {
        val vm = ApprovalsViewModel(repository, SavedStateHandle())
        assertEquals(listOf("r1"), vm.uiState.value.items.map { it.id })
        vm.onFilterSelected(ApprovalStatus.APPROVED)
        assertEquals(listOf("r2"), vm.uiState.value.items.map { it.id })
        assertEquals(listOf(ApprovalStatus.PENDING, ApprovalStatus.APPROVED), repository.inboxCalls)
    }

    @Test
    fun a_decision_elsewhere_reloads_the_inbox() = runTest {
        val vm = ApprovalsViewModel(repository, SavedStateHandle())
        repository.decide("r1", ApprovalDecision.APPROVED, null)
        assertEquals(emptyList<String>(), vm.uiState.value.items.map { it.id })
    }
}
