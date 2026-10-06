package com.schoolapp.feature.certificates

import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.certificates.parent.ParentCertificatesViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ParentCertificatesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val parent = FakeAuthRepository(
        TestSessions.session(RoleKey.PARENT, "certificates.view", "certificates.add", branchId = null).copy(
            children = listOf(ChildSummary("st1", "Ayesha Khan"), ChildSummary("st2", "Omar Khan")),
            activeChildId = "st1",
        ),
    )
    private val repo = FakeCertificatesRepository(
        listOf(
            certificate("c1", "st1", CertificateType.CHARACTER, CertificateStatus.ISSUED),
            certificate("c2", "st2", CertificateType.SCHOOL_LEAVING),
        ),
    )

    @Test
    fun loads_active_child_and_reloads_on_switch() {
        val vm = ParentCertificatesViewModel(parent, repo)
        assertEquals("st1", vm.uiState.value.childId)
        assertEquals(listOf("c1"), vm.uiState.value.certificates.map { it.id })
        assertTrue(vm.uiState.value.canRequest)

        parent.sessionState.value = parent.sessionState.value?.copy(activeChildId = "st2")
        assertEquals("st2", vm.uiState.value.childId)
        assertEquals(listOf("c2"), vm.uiState.value.certificates.map { it.id })
        assertEquals(listOf<Pair<String?, CertificateStatus?>>("st1" to null, "st2" to null), repo.queries)
    }

    @Test
    fun request_requires_type_and_adds_to_list() {
        val vm = ParentCertificatesViewModel(parent, repo)
        vm.openForm()
        vm.submit()
        assertTrue(vm.uiState.value.form!!.typeMissing)
        assertTrue(repo.requests.isEmpty())

        vm.onTypeChange(CertificateType.TRANSFER)
        vm.onPurposeChange("  ")
        vm.submit()
        val input = repo.requests.single()
        assertEquals("st1", input.studentId)
        assertEquals(CertificateType.TRANSFER, input.type)
        assertNull(input.purpose)
        assertNull(vm.uiState.value.form)
        assertTrue(vm.uiState.value.requested)
        assertEquals("new_1", vm.uiState.value.certificates.first().id)
    }

    @Test
    fun without_add_permission_cannot_request() {
        val viewer = FakeAuthRepository(
            TestSessions.session(RoleKey.PARENT, "certificates.view", branchId = null).copy(children = listOf(ChildSummary("st1", "Ayesha Khan"))),
        )
        val vm = ParentCertificatesViewModel(viewer, repo)
        assertFalse(vm.uiState.value.canRequest)
        vm.openForm()
        assertNull(vm.uiState.value.form)
    }
}
