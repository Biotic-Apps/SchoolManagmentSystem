package com.schoolapp.feature.attendance

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.attendance.register.RegisterMessage
import com.schoolapp.feature.attendance.register.RegisterViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class RegisterViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val roster = listOf(
        entry("s1", "Ali Khan", 1),
        entry("s2", "Sana Malik", 2),
        entry("s3", "Hira Shah", 3, onLeave = true),
    )
    private val repository = FakeAttendanceRepository(LoadedRegister(register(entries = roster)))
    private val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "attendance.view", "attendance.edit", "attendance.submit"))

    private fun viewModel(auth: FakeAuthRepository = teacher) = RegisterViewModel(
        SavedStateHandle(mapOf("sectionId" to "sec1", "date" to "2026-10-06", "title" to "Class 5 - A")),
        repository,
        FakeHealthRepository(),
        auth,
    )

    @Test
    fun tap_cycles_status_starting_at_present_and_leave_is_prefilled() {
        val vm = viewModel()
        assertEquals(AttendanceStatus.LEAVE, vm.uiState.value.marks["s3"])
        val seen = (1..6).map {
            vm.onRowTap("s1")
            vm.uiState.value.marks["s1"]
        }
        assertEquals(
            listOf(
                AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE,
                AttendanceStatus.LEAVE, AttendanceStatus.HALF_DAY, AttendanceStatus.PRESENT,
            ),
            seen,
        )
        assertTrue(vm.uiState.value.hasUnsentChanges)
    }

    @Test
    fun mark_all_present_skips_students_on_leave() {
        val vm = viewModel()
        vm.markAllPresent()
        val marks = vm.uiState.value.marks
        assertEquals(AttendanceStatus.PRESENT, marks["s1"])
        assertEquals(AttendanceStatus.PRESENT, marks["s2"])
        assertEquals(AttendanceStatus.LEAVE, marks["s3"])
    }

    @Test
    fun submit_with_unmarked_students_is_blocked() {
        val vm = viewModel()
        vm.onRowTap("s1")
        vm.onSubmitClick()
        assertEquals(1, vm.uiState.value.unmarkedBlocking)
        assertFalse(vm.uiState.value.confirmSubmit)
        assertTrue(repository.submitCalls.isEmpty())

        vm.onRowTap("s2")
        vm.onSubmitClick()
        assertTrue(vm.uiState.value.confirmSubmit)
        vm.onConfirmSubmit()
        assertEquals(1, repository.submitCalls.size)
        assertEquals(RegisterMessage.SUBMITTED, vm.uiState.value.message)
    }

    @Test
    fun failed_submit_retries_with_same_request_id_then_queues_offline() {
        repository.results += AppResult.Failure(AppError.Network)
        repository.results += AppResult.Success(RegisterOutcome.Queued)
        repository.results += AppResult.Success(RegisterOutcome.Queued)
        val vm = viewModel()
        vm.markAllPresent()
        vm.onSubmitClick()
        vm.onConfirmSubmit()
        assertEquals(AppError.Network, vm.uiState.value.actionError)
        vm.onSubmitClick()
        vm.onConfirmSubmit()
        val state = vm.uiState.value
        assertEquals(RegisterMessage.QUEUED, state.message)
        assertTrue(state.hasUnsentChanges)
        assertEquals(AttendanceStatus.PRESENT, state.marks["s1"])
        assertEquals(repository.submitCalls[0].second, repository.submitCalls[1].second)
        assertNull(state.pendingAttempt)

        vm.onRowTap("s2")
        vm.onSubmitClick()
        vm.onConfirmSubmit()
        assertNotEquals(repository.submitCalls[1].second, repository.submitCalls[2].second)
    }

    @Test
    fun already_submitted_shows_server_register_read_only_with_comparison() {
        val server = register(
            status = RegisterStatus.SUBMITTED,
            entries = listOf(
                entry("s1", "Ali Khan", 1, AttendanceStatus.ABSENT),
                entry("s2", "Sana Malik", 2, AttendanceStatus.PRESENT),
                entry("s3", "Hira Shah", 3, AttendanceStatus.LEAVE, onLeave = true),
            ),
            submittedBy = PersonRef("t2", "Bilal Ahmed"),
        )
        repository.results += AppResult.Success(RegisterOutcome.AlreadySubmitted(server))
        val vm = viewModel()
        vm.markAllPresent()
        vm.onSubmitClick()
        vm.onConfirmSubmit()

        val state = vm.uiState.value
        assertEquals("Bilal Ahmed", state.conflict?.submittedBy)
        assertEquals(RegisterStatus.SUBMITTED, state.status)
        assertTrue(state.isReadOnly)
        assertEquals(AttendanceStatus.ABSENT, state.marks["s1"])

        vm.onToggleCompare()
        val differing = vm.uiState.value.entries.filter { it.differs }
        assertEquals(listOf("s1"), differing.map { it.studentId })
        assertEquals(AttendanceStatus.PRESENT, differing.single().myStatus)

        vm.onRowTap("s2")
        assertEquals(AttendanceStatus.PRESENT, vm.uiState.value.marks["s2"])

        vm.discardLocalMarks()
        assertEquals(1, repository.discardCalls)
        assertNull(vm.uiState.value.conflict)
    }

    @Test
    fun locked_outcome_makes_register_read_only() {
        repository.results += AppResult.Success(RegisterOutcome.Locked)
        val vm = viewModel()
        vm.markAllPresent()
        vm.onSubmitClick()
        vm.onConfirmSubmit()
        val state = vm.uiState.value
        assertEquals(RegisterStatus.LOCKED, state.status)
        assertEquals(RegisterMessage.LOCKED, state.message)
        assertTrue(state.isReadOnly)

        vm.onRowTap("s1")
        assertEquals("e_s1", vm.uiState.value.correction?.entryId)
    }

    @Test
    fun helper_can_only_save_draft() {
        val helper = FakeAuthRepository(TestSessions.session(RoleKey.HELPER, "attendance.view", "attendance.edit", "attendance.submit"))
        val vm = viewModel(helper)
        assertTrue(vm.uiState.value.isHelper)
        assertFalse(vm.uiState.value.showSubmit)
        vm.markAllPresent()
        vm.onSubmitClick()
        vm.onConfirmSubmit()
        assertTrue(repository.submitCalls.isEmpty())

        vm.saveDraft()
        assertEquals(1, repository.draftCalls.size)
        assertEquals(
            listOf(
                EntryMark("s1", AttendanceStatus.PRESENT),
                EntryMark("s2", AttendanceStatus.PRESENT),
                EntryMark("s3", AttendanceStatus.LEAVE),
            ),
            repository.draftCalls.single().first,
        )
        assertEquals(RegisterMessage.DRAFT_SAVED, vm.uiState.value.message)
    }

    @Test
    fun local_marks_override_server_and_supervisor_without_proxy_is_read_only() {
        repository.loaded = LoadedRegister(register(entries = roster), localMarks = listOf(EntryMark("s1", AttendanceStatus.LATE)))
        val vm = viewModel()
        assertEquals(AttendanceStatus.LATE, vm.uiState.value.marks["s1"])
        assertNull(vm.uiState.value.marks["s2"])
        assertTrue(vm.uiState.value.hasUnsentChanges)

        val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "attendance.view", "attendance.edit", "attendance.submit"))
        assertTrue(viewModel(principal).uiState.value.isReadOnly)
        val proxy = FakeAuthRepository(
            TestSessions.session(RoleKey.PRINCIPAL, "attendance.view", "attendance.edit", "attendance.submit", "teacherwork.proxy"),
        )
        assertFalse(viewModel(proxy).uiState.value.isReadOnly)
    }
}
