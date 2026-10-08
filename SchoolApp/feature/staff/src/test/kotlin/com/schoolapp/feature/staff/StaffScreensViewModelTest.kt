package com.schoolapp.feature.staff

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.staff.AllocationSection
import com.schoolapp.core.model.staff.AllocationSubject
import com.schoolapp.core.model.staff.AllocationTeacher
import com.schoolapp.core.model.staff.ClassAllocation
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.staff.assign.AssignClassesViewModel
import com.schoolapp.feature.staff.assign.SubjectPick
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.detail.StaffDetailViewModel
import com.schoolapp.feature.staff.edit.EditStaffViewModel
import com.schoolapp.feature.staff.list.StaffListViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class StaffScreensViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 8, 9, 0) }
    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "staff.view", "staff.add", "staff.edit"))
    private val coordinator = FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "staff.view"))
    private val events = StaffEvents()
    private val admin = FakeStaffAdminRepository()

    @Test
    fun add_button_only_for_roles_with_staff_add() {
        assertTrue(StaffListViewModel(FakeStaffRepository(), principal, events).uiState.value.canAdd)
        assertFalse(StaffListViewModel(FakeStaffRepository(), coordinator, events).uiState.value.canAdd)
    }

    @Test
    fun list_reloads_after_a_staff_change() {
        val repository = FakeStaffRepository()
        val vm = StaffListViewModel(repository, principal, events)
        vm.retry()
        val before = repository.listCalls
        events.changed()
        assertEquals(before + 1, repository.listCalls)
        assertFalse(vm.uiState.value.isLoading)
    }

    @Test
    fun detail_actions_follow_staff_edit_and_block_own_status() {
        val handle = SavedStateHandle(mapOf("id" to "st1"))
        val asPrincipal = StaffDetailViewModel(handle, FakeStaffRepository(), admin, principal, events, clock).uiState.value
        assertTrue(asPrincipal.canEdit)
        assertTrue(asPrincipal.canChangeStatus)
        assertTrue(asPrincipal.canAssign)

        val asCoordinator = StaffDetailViewModel(handle, FakeStaffRepository(), admin, coordinator, events, clock).uiState.value
        assertFalse(asCoordinator.canEdit)
        assertFalse(asCoordinator.canAssign)

        val own = StaffDetailViewModel(handle, FakeStaffRepository(detail(summary(userId = "u1"))), admin, principal, events, clock)
        assertFalse(own.uiState.value.canChangeStatus)
    }

    @Test
    fun deactivating_needs_status_and_reason_then_posts_it() {
        val staff = FakeStaffRepository()
        admin.onStatus = { staff.member = detail(summary(status = it)) }
        val vm = StaffDetailViewModel(SavedStateHandle(mapOf("id" to "st1")), staff, admin, principal, events, clock)
        vm.openStatusChange()
        assertFalse("current status is not offered", "ACTIVE" in vm.uiState.value.statusChange!!.options)
        vm.submitStatusChange()
        assertTrue(vm.uiState.value.statusChange!!.statusMissing)
        assertTrue(vm.uiState.value.statusChange!!.reasonInvalid)

        vm.onStatus("RESIGNED")
        vm.onReason("Moved to another city")
        assertTrue(vm.uiState.value.statusChange!!.leaving)
        vm.submitStatusChange()
        assertEquals("RESIGNED", admin.statusChanges.single().status)
        assertEquals("2026-10-08", admin.statusChanges.single().effectiveDate)
        assertNull(vm.uiState.value.statusChange)
        assertEquals("RESIGNED", vm.uiState.value.detail?.summary?.status)
        assertFalse(vm.uiState.value.canAssign)
    }

    @Test
    fun edit_prefills_and_saves_profile() {
        val vm = EditStaffViewModel(SavedStateHandle(mapOf("id" to "st1")), FakeStaffRepository(), admin, principal, events)
        assertEquals("Ayesha Khan", vm.uiState.value.form.name)
        vm.onFormChange(vm.uiState.value.form.copy(name = " "))
        vm.save()
        assertTrue(admin.updates.isEmpty())
        vm.onFormChange(vm.uiState.value.form.copy(name = "Ayesha K. Khan", phone = "03001234567"))
        vm.save()
        assertEquals("Ayesha K. Khan", admin.updates.single().second.name)
        assertNull("blank CNIC keeps the one on file", admin.updates.single().second.cnic)
        assertTrue(vm.uiState.value.saved)
    }

    @Test
    fun assign_saves_class_teacher_and_subject_picks_and_keeps_failures() {
        val allocation = ClassAllocation(
            classId = "c1",
            className = "Class 1",
            sections = listOf(AllocationSection("secA", "A", null, null), AllocationSection("secB", "B", "Science", null)),
            subjects = listOf(AllocationSubject("eng", "English", null), AllocationSubject("bio", "Biology", "Science")),
            subjectTeachers = mapOf(("secA" to "eng") to AllocationTeacher("other", "Ms Sana")),
            canAllocate = true,
        )
        val repository = FakeAllocationRepository(allocation).apply { failSectionIds = setOf("secB") }
        val handle = SavedStateHandle(mapOf("staffId" to "st1", "staffName" to "Ayesha Khan", "branchId" to "b1"))
        val vm = AssignClassesViewModel(handle, repository, FakeClassesOverviewRepository(), principal, events)
        assertEquals("c1", vm.uiState.value.selectedClassId)
        assertTrue(allocation.subjects[1].appliesTo(allocation.sections[1]))
        assertFalse(allocation.subjects[1].appliesTo(allocation.sections[0]))

        vm.toggleClassTeacher("secA")
        vm.toggleSubject("secA", "eng")
        vm.toggleSubject("secB", "bio")
        assertEquals(3, vm.uiState.value.pickCount)
        vm.save()

        assertEquals(listOf("secA" to "st1"), repository.classTeacherCalls)
        assertEquals(2, repository.subjectCalls.size)
        val state = vm.uiState.value
        assertFalse(state.done)
        assertEquals(1, state.failedCount)
        assertEquals(setOf(SubjectPick("secB", "bio")), state.subjectPicks)
        assertEquals("st1", state.selectedAllocation?.sections?.first()?.classTeacher?.staffId)
        assertEquals("st1", state.selectedAllocation?.subjectTeachers?.get("secA" to "eng")?.staffId)
        assertEquals(1, events.changes.value)

        repository.failSectionIds = emptySet()
        vm.save()
        assertTrue(vm.uiState.value.done)
    }

    @Test
    fun assign_is_blocked_without_allocation_permission() {
        val handle = SavedStateHandle(mapOf("staffId" to "st1", "staffName" to "A", "branchId" to "b1"))
        val allocation = ClassAllocation("c1", "Class 1", emptyList(), emptyList(), emptyMap(), true)
        val vm = AssignClassesViewModel(handle, FakeAllocationRepository(allocation), FakeClassesOverviewRepository(), coordinator, events)
        assertFalse(vm.uiState.value.canAllocate)
    }
}
