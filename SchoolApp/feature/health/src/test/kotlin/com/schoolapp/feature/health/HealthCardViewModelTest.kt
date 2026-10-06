package com.schoolapp.feature.health

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.health.EmergencyContact
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.health.card.HealthCardViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class HealthCardViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val health = FakeHealthRepository()
    private val students = FakeStudentsRepository()
    private val parentSession = TestSessions.session(RoleKey.PARENT, "health.view").copy(
        children = listOf(ChildSummary("c1", "Ayesha Khan"), ChildSummary("c2", "Omar Khan")),
        activeChildId = "c1",
    )
    private val auth = FakeAuthRepository(parentSession)

    private fun profile(vararg contacts: EmergencyContact) =
        HealthProfile("B+", emptyList(), emptyList(), emptyList(), null, null, contacts.toList(), "2026-10-01T08:00:00Z")

    private fun viewModel(studentId: String? = null) =
        HealthCardViewModel(SavedStateHandle(mapOf("studentId" to studentId)), health, students, auth)

    @Test
    fun parent_card_follows_active_child_and_reloads_on_switch() {
        health.profiles = mapOf("c1" to profile(), "c2" to profile())
        val vm = viewModel()
        assertEquals("c1", vm.uiState.value.studentId)
        assertEquals("Ayesha Khan", vm.uiState.value.studentName)
        assertTrue(vm.uiState.value.isParent)
        assertFalse(vm.uiState.value.canReport)

        auth.sessionState.value = parentSession.copy(activeChildId = "c2")
        assertEquals(listOf("c1", "c2"), health.profileCalls)
        assertEquals("c2", vm.uiState.value.studentId)
        assertEquals("Omar Khan", vm.uiState.value.studentName)
        assertEquals(listOf<String?>("c1", "c2"), health.incidentCalls)
    }

    @Test
    fun emergency_contacts_are_sorted_by_priority() {
        health.profiles = mapOf(
            "s1" to profile(
                EmergencyContact("Uncle", "Uncle", "0300", 3),
                EmergencyContact("Mother", "Mother", "0301", 1),
                EmergencyContact("Father", "Father", "0302", 2),
            ),
        )
        auth.sessionState.value = TestSessions.session(RoleKey.PRINCIPAL, "health.view", "health.edit")
        val vm = viewModel("s1")
        val state = vm.uiState.value
        assertEquals(listOf("Mother", "Father", "Uncle"), state.profile!!.emergencyContacts.map { it.name })
        assertEquals("Student s1", state.studentName)
        assertTrue(state.canReport)
        assertTrue(health.incidentCalls.isEmpty())
    }

    @Test
    fun change_request_requires_contact_phone_then_sends_priorities_in_order() {
        health.profiles = mapOf("c1" to profile(EmergencyContact("Mother", "Mother", "0301", 1)))
        val vm = viewModel()
        vm.openChangeRequest()
        vm.addContact()
        val added = vm.uiState.value.editor!!.contacts.last()
        vm.onContactChange(added.copy(name = "Aunt"))
        vm.submitChangeRequest()
        assertTrue(vm.uiState.value.editor!!.showErrors)
        assertTrue(health.changeRequests.isEmpty())

        vm.onContactChange(added.copy(name = "Aunt", phone = "0333"))
        vm.submitChangeRequest()
        assertNull(vm.uiState.value.editor)
        assertTrue(vm.uiState.value.requestSent)
        val sent = health.changeRequests.single()
        assertEquals("c1", sent.first)
        assertEquals(listOf(1, 2), sent.second.emergencyContacts!!.map { it.priority })
    }
}
