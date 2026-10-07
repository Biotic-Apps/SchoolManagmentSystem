package com.schoolapp.feature.attendance

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.StaffMark
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.attendance.staffmark.StaffMarkMessage
import com.schoolapp.feature.attendance.staffmark.StaffMarkViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class StaffMarkViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) }
    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "attendance.view", "attendance.approve"))
    private val repository = FakeStaffAttendanceRepository(
        listOf(
            staffEntry("st1", "Sana Iqbal", AttendanceStatus.PRESENT, checkIn = "07:50", checkOut = "14:00"),
            staffEntry("st2", "Bilal Ahmed"),
            staffEntry("st3", "Hina Shah"),
        ),
    )
    private val branches = FakeBranchesRepository(AppResult.Success(listOf(branch("b1", "Main"), branch("b2", "North"))))

    private fun viewModel(auth: FakeAuthRepository = principal) = StaffMarkViewModel(auth, repository, branches, clock)

    @Test
    fun role_without_approve_permission_cannot_mark_and_loads_nothing() {
        val coordinator = FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "attendance.view"))
        val vm = viewModel(coordinator)
        vm.start()

        assertFalse(vm.uiState.value.canMark)
        assertTrue(repository.sheetCalls.isEmpty())
    }

    @Test
    fun branch_bound_principal_loads_own_branch_for_today_on_start() {
        val vm = viewModel()
        assertTrue(vm.uiState.value.canMark)
        assertTrue(repository.sheetCalls.isEmpty())

        vm.start()
        vm.start()

        val state = vm.uiState.value
        assertEquals(listOf("b1" to "2026-10-06"), repository.sheetCalls)
        assertEquals(0, branches.branchCalls)
        assertFalse(state.showBranchPicker)
        assertFalse(state.isLoading)
        assertEquals(listOf("st1", "st2", "st3"), state.rows.map { it.staffId })
        assertEquals(1, state.counts.present)
        assertEquals(2, state.counts.unmarked)
        assertFalse(state.dirty)
    }

    @Test
    fun global_super_admin_picks_from_branches_and_switching_reloads() {
        val admin = FakeAuthRepository(TestSessions.session(RoleKey.SUPER_ADMIN, "attendance.approve", branchId = null))
        val vm = viewModel(admin)
        vm.start()

        assertTrue(vm.uiState.value.showBranchPicker)
        assertEquals("b1", vm.uiState.value.branchId)
        vm.onStatusSelected("st2", AttendanceStatus.ABSENT)

        vm.onBranchSelected("b2")

        assertEquals(listOf("b1" to "2026-10-06", "b2" to "2026-10-06"), repository.sheetCalls)
        assertFalse(vm.uiState.value.dirty)
    }

    @Test
    fun branch_list_failure_shows_error_and_retry_resolves_again() {
        val admin = FakeAuthRepository(TestSessions.session(RoleKey.SUPER_ADMIN, "attendance.approve", branchId = null))
        branches.branches = AppResult.Failure(AppError.Network)
        val vm = viewModel(admin)
        vm.start()
        assertEquals(AppError.Network, vm.uiState.value.error)

        branches.branches = AppResult.Success(listOf(branch("b2", "North")))
        vm.retry()

        assertEquals("b2", vm.uiState.value.branchId)
        assertNull(vm.uiState.value.error)
        assertEquals(listOf("b2" to "2026-10-06"), repository.sheetCalls)
    }

    @Test
    fun absent_or_leave_clears_times_and_mark_all_present_keeps_existing_marks() {
        val vm = viewModel().apply { start() }

        vm.onStatusSelected("st1", AttendanceStatus.ABSENT)
        val absent = vm.uiState.value.rows.first { it.staffId == "st1" }
        assertNull(absent.checkIn)
        assertNull(absent.checkOut)
        assertFalse(absent.timesEnabled)

        vm.markAllPresent()

        val statuses = vm.uiState.value.rows.associate { it.staffId to it.status }
        assertEquals(AttendanceStatus.ABSENT, statuses["st1"])
        assertEquals(AttendanceStatus.PRESENT, statuses["st2"])
        assertEquals(AttendanceStatus.PRESENT, statuses["st3"])
        assertEquals(0, vm.uiState.value.counts.unmarked)
        assertTrue(vm.uiState.value.dirty)
    }

    @Test
    fun save_sends_marked_rows_with_times_and_remarks_then_clears_edits() {
        val vm = viewModel().apply { start() }
        vm.onStatusSelected("st2", AttendanceStatus.LATE)
        vm.onCheckInChange("st2", "08:25")
        vm.onRemarkChange("st2", " Traffic ")

        vm.save()

        val (branchId, date, marks) = repository.saveCalls.single()
        assertEquals("b1" to "2026-10-06", branchId to date)
        assertEquals(
            listOf(
                StaffMark("st1", AttendanceStatus.PRESENT, "07:50", "14:00", null),
                StaffMark("st2", AttendanceStatus.LATE, "08:25", null, "Traffic"),
            ),
            marks,
        )
        val state = vm.uiState.value
        assertFalse(state.dirty)
        assertFalse(state.isSaving)
        assertEquals(StaffMarkMessage.SAVED, state.message)
        assertEquals(AttendanceStatus.LATE, state.rows.first { it.staffId == "st2" }.status)
    }

    @Test
    fun save_failure_keeps_edits_and_reports_the_error() {
        val vm = viewModel().apply { start() }
        repository.saveError = AppError.Validation("Not a working day")
        vm.onStatusSelected("st3", AttendanceStatus.PRESENT)

        vm.save()

        val state = vm.uiState.value
        assertEquals(AppError.Validation("Not a working day"), state.actionError)
        assertTrue(state.dirty)
        assertNull(state.message)

        vm.onStatusSelected("st3", AttendanceStatus.HALF_DAY)
        assertNull(vm.uiState.value.actionError)
    }

    @Test
    fun save_does_nothing_without_changes() {
        val vm = viewModel().apply { start() }
        vm.save()
        assertTrue(repository.saveCalls.isEmpty())
    }

    @Test
    fun clear_times_drops_saved_times_and_future_dates_are_ignored() {
        val vm = viewModel().apply { start() }
        vm.clearTimes("st1")
        val row = vm.uiState.value.rows.first { it.staffId == "st1" }
        assertNull(row.checkIn)
        assertNull(row.checkOut)
        assertEquals(AttendanceStatus.PRESENT, row.status)

        vm.onDateSelected("2026-10-07")
        assertEquals("2026-10-06", vm.uiState.value.date)

        vm.onDateSelected("2026-10-05")
        assertEquals("2026-10-05", vm.uiState.value.date)
        assertFalse(vm.uiState.value.dirty)
        assertEquals("b1" to "2026-10-05", repository.sheetCalls.last())
    }

    @Test
    fun details_sheet_opens_for_a_row_and_closes() {
        val vm = viewModel().apply { start() }
        vm.openDetails("st2")
        assertEquals("Bilal Ahmed", vm.uiState.value.details?.name)
        vm.closeDetails()
        assertNull(vm.uiState.value.details)
    }
}
