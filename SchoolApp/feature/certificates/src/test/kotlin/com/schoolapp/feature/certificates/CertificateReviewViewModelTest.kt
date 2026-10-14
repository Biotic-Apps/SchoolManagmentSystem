package com.schoolapp.feature.certificates

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.certificates.ClearanceBlock
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.certificates.review.CertificateReviewViewModel
import com.schoolapp.feature.certificates.review.ReviewFilter
import com.schoolapp.feature.certificates.review.ReviewMessage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class CertificateReviewViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "certificates.view", "certificates.approve"))
    private val clearance = ClearanceBlock(450_000, listOf("Library book"), listOf("Outstanding fee balance"))
    private val repo = FakeCertificatesRepository(
        listOf(
            certificate("leave", "st2", CertificateType.SCHOOL_LEAVING),
            certificate("transfer", "st3", CertificateType.TRANSFER),
            certificate("issued", "st1", CertificateType.CHARACTER, CertificateStatus.ISSUED),
        ),
    ).apply { blocks = mapOf("leave" to clearance) }

    @Test
    fun defaults_to_requested_and_filters() {
        val vm = CertificateReviewViewModel(principal, repo, FakeStudentsRepository())
        assertEquals(ReviewFilter.REQUESTED, vm.uiState.value.filter)
        assertEquals(listOf("leave", "transfer"), vm.uiState.value.certificates.map { it.id })
        vm.onFilterChange(ReviewFilter.ALL)
        assertEquals(3, vm.uiState.value.certificates.size)
    }

    @Test
    fun blocked_approval_keeps_requested_and_exposes_clearance() {
        val vm = CertificateReviewViewModel(principal, repo, FakeStudentsRepository())
        vm.approve("leave")
        val state = vm.uiState.value
        assertEquals(clearance, state.blocked["leave"])
        assertEquals(CertificateStatus.REQUESTED, state.certificates.first { it.id == "leave" }.status)
        assertNull(state.message)
        assertTrue(state.busyIds.isEmpty())
    }

    @Test
    fun clean_approval_updates_status() {
        val vm = CertificateReviewViewModel(principal, repo, FakeStudentsRepository())
        vm.approve("transfer")
        assertEquals(CertificateStatus.APPROVED, vm.uiState.value.certificates.first { it.id == "transfer" }.status)
        assertEquals(ReviewMessage.APPROVED, vm.uiState.value.message)
    }

    @Test
    fun reject_requires_reason() {
        val vm = CertificateReviewViewModel(principal, repo, FakeStudentsRepository())
        vm.openReject("transfer")
        vm.onRejectReasonChange("   ")
        vm.submitReject()
        assertTrue(vm.uiState.value.rejectForm!!.reasonMissing)
        assertTrue(repo.rejects.isEmpty())

        vm.onRejectReasonChange("Wrong student selected")
        vm.submitReject()
        assertEquals("transfer" to "Wrong student selected", repo.rejects.single())
        assertNull(vm.uiState.value.rejectForm)
        assertEquals(CertificateStatus.REJECTED, vm.uiState.value.certificates.first { it.id == "transfer" }.status)
    }

    @Test
    fun without_approve_permission_actions_are_ignored() {
        val office = FakeAuthRepository(TestSessions.session(RoleKey.ACCOUNTANT, "certificates.view"))
        val vm = CertificateReviewViewModel(office, repo, FakeStudentsRepository())
        vm.approve("transfer")
        vm.openReject("transfer")
        assertNull(vm.uiState.value.rejectForm)
        assertEquals(CertificateStatus.REQUESTED, vm.uiState.value.certificates.first { it.id == "transfer" }.status)
    }
}
