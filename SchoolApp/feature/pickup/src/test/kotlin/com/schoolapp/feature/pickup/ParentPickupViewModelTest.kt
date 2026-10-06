package com.schoolapp.feature.pickup

import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.pickup.PickupPersonStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.pickup.parent.LeaveField
import com.schoolapp.feature.pickup.parent.ParentPickupMessage
import com.schoolapp.feature.pickup.parent.ParentPickupViewModel
import com.schoolapp.feature.pickup.parent.PersonField
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class ParentPickupViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakePickupRepository()
    private val session = TestSessions.session(RoleKey.PARENT, "pickup.view").copy(
        children = listOf(ChildSummary("c1", "Ayesha"), ChildSummary("c2", "Omar")),
        activeChildId = "c1",
    )
    private val auth = FakeAuthRepository(session)
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) }

    private fun viewModel() = ParentPickupViewModel(repository, FakeFilesRepository(), auth, clock)

    @Test
    fun add_person_requires_name_relation_and_valid_phone() {
        val vm = viewModel()
        vm.openAddPerson()
        vm.submitPerson()
        assertEquals(setOf(PersonField.NAME, PersonField.RELATION, PersonField.PHONE), vm.uiState.value.personEditor!!.errors)

        vm.onPersonChange { it.copy(name = "Aslam", relation = "Driver", phone = "12", cnic = "123") }
        vm.submitPerson()
        assertEquals(setOf(PersonField.PHONE_FORMAT, PersonField.CNIC_FORMAT), vm.uiState.value.personEditor!!.errors)
        assertTrue(repository.added.isEmpty())

        vm.onPhotoPicked("content://photo")
        vm.onPersonChange { it.copy(phone = "0300 1234567", cnic = "35202-1234567-1") }
        vm.submitPerson()
        assertNull(vm.uiState.value.personEditor)
        val (studentId, input) = repository.added.single()
        assertEquals("c1", studentId)
        assertEquals("f1", input.photoFileId)
        assertEquals(PickupPersonStatus.PENDING_VERIFICATION, vm.uiState.value.persons.single().status)
        assertEquals(ParentPickupMessage.PERSON_ADDED, vm.uiState.value.message)
    }

    @Test
    fun early_leave_rejects_past_date_and_reloads_on_child_switch() {
        val vm = viewModel()
        vm.openEarlyLeave()
        vm.onLeaveChange { it.copy(date = "2026-10-05") }
        vm.submitEarlyLeave()
        assertEquals(setOf(LeaveField.DATE_PAST, LeaveField.TIME, LeaveField.REASON), vm.uiState.value.leaveEditor!!.errors)

        vm.onLeaveChange { it.copy(date = "2026-10-06", time = "11:30", reason = "Dentist") }
        vm.submitEarlyLeave()
        assertEquals("c1", repository.leaveInputs.single().studentId)
        assertEquals(1, vm.uiState.value.earlyLeaves.size)

        auth.sessionState.value = session.copy(activeChildId = "c2")
        assertEquals(listOf("c1", "c2"), repository.personCalls)
        assertEquals("c2", vm.uiState.value.childId)
    }
}
