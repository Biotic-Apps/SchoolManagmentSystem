package com.schoolapp.feature.meetings

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.meetings.domain.SlotProblem
import com.schoolapp.feature.meetings.staff.StaffMeetingsTab
import com.schoolapp.feature.meetings.staff.slots.MySlotsViewModel
import com.schoolapp.feature.meetings.staff.slots.SlotsNotice
import com.schoolapp.feature.meetings.staff.visibleStaffTabs
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class MySlotsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeMeetingsRepository()
    private val clock = AppClock { LocalDateTime.of(2026, 10, 7, 10, 0) }

    private fun viewModel(role: RoleRef = RoleKey.TEACHER, permissions: List<String> = listOf("meetings.view", "meetings.add")) =
        MySlotsViewModel(repository, FakeAuthRepository(TestSessions.session(role, *permissions.toTypedArray())), clock)

    @Test
    fun loads_callers_current_week_grouped_by_day() {
        val state = viewModel().uiState.value
        assertTrue(state.canPublish)
        assertEquals(Triple("u1", "2026-10-05", "2026-10-11"), repository.mySlotRequests.single())
        assertEquals(listOf("2026-10-06", "2026-10-08"), state.days.map { it.date })
        assertTrue(state.isThisWeek)
        assertFalse(state.isLoading)
    }

    @Test
    fun staff_without_add_permission_and_parents_get_no_tab() {
        val viewOnly = viewModel(RoleKey.HELPER, listOf("meetings.view")).uiState.value
        val parent = viewModel(RoleKey.PARENT, listOf("meetings.view", "meetings.add")).uiState.value
        assertFalse(viewOnly.canPublish)
        assertFalse(parent.canPublish)
        assertTrue(repository.mySlotRequests.isEmpty())
        assertEquals(listOf(StaffMeetingsTab.UPCOMING, StaffMeetingsTab.PAST, StaffMeetingsTab.FOLLOW_UPS), visibleStaffTabs(false))
        assertEquals(StaffMeetingsTab.entries, visibleStaffTabs(true))
    }

    @Test
    fun week_paging_reloads_and_returns_to_this_week() {
        val vm = viewModel()
        vm.nextWeek()
        assertEquals(Triple("u1", "2026-10-12", "2026-10-18"), repository.mySlotRequests.last())
        assertFalse(vm.uiState.value.isThisWeek)
        vm.previousWeek()
        vm.previousWeek()
        assertEquals("2026-09-28", vm.uiState.value.weekStart)
        vm.thisWeek()
        assertEquals("2026-10-05", vm.uiState.value.weekStart)
        assertTrue(vm.uiState.value.isThisWeek)
    }

    @Test
    fun sheet_starts_today_in_current_week_and_on_monday_of_a_later_week() {
        val vm = viewModel()
        vm.openSheet()
        assertEquals("2026-10-07", vm.uiState.value.sheet?.form?.drafts?.single()?.date)
        assertEquals("2026-10-07", vm.uiState.value.sheet?.minDate)
        vm.dismissSheet()
        vm.nextWeek()
        vm.openSheet()
        assertEquals("2026-10-12", vm.uiState.value.sheet?.form?.drafts?.single()?.date)
    }

    @Test
    fun invalid_rows_block_publishing() {
        val vm = viewModel()
        vm.openSheet()
        vm.updateDraft(0) { it.copy(startTime = "09:00", endTime = "09:30") }
        vm.publish()
        assertEquals(mapOf(0 to setOf(SlotProblem.START_PAST)), vm.uiState.value.sheet?.problems)
        vm.updateDraft(0) { it.copy(startTime = "14:00", endTime = "13:00") }
        assertTrue(vm.uiState.value.sheet?.problems.orEmpty().isEmpty())
        vm.publish()
        assertEquals(mapOf(0 to setOf(SlotProblem.END_BEFORE_START)), vm.uiState.value.sheet?.problems)
        assertTrue(repository.published.isEmpty())
    }

    @Test
    fun publishing_several_rows_closes_sheet_and_reloads() {
        val vm = viewModel()
        vm.openSheet()
        vm.updateDraft(0) { it.copy(mode = MeetingMode.VIDEO, location = " Zoom ") }
        vm.addRow()
        vm.publish()
        val sent = repository.published.single()
        assertEquals(listOf("13:00", "13:15"), sent.map { it.startTime })
        assertEquals(listOf("Zoom", "Zoom"), sent.map { it.location })
        val state = vm.uiState.value
        assertNull(state.sheet)
        assertEquals(SlotsNotice.Published(2), state.notice)
        assertEquals(2, repository.mySlotRequests.size)
    }

    @Test
    fun server_conflict_keeps_sheet_open_with_error() {
        val vm = viewModel()
        repository.publishError = AppError.Server(409, "CONFLICT", "Slot overlaps an existing slot")
        vm.openSheet()
        vm.publish()
        val sheet = vm.uiState.value.sheet
        assertNotNull(sheet)
        assertFalse(sheet!!.isSaving)
        assertEquals(repository.publishError, sheet.error)
    }

    @Test
    fun only_free_slots_can_be_removed() {
        val vm = viewModel()
        val booked = vm.uiState.value.days.flatMap { it.slots }.first { it.id == "m2" }
        vm.askDelete(booked)
        assertNull(vm.uiState.value.deleteTarget)

        val free = vm.uiState.value.days.flatMap { it.slots }.first { it.id == "m1" }
        vm.askDelete(free)
        vm.confirmDelete()
        val state = vm.uiState.value
        assertEquals(listOf("m1"), repository.removed)
        assertEquals(SlotsNotice.Removed, state.notice)
        assertEquals(listOf("m2"), state.days.flatMap { it.slots }.map { it.id })
        assertNull(state.deletingId)
    }

    @Test
    fun failed_remove_shows_error_and_reloads() {
        val vm = viewModel()
        repository.removeError = AppError.Server(409, "CONFLICT", "Only open slots can be removed")
        vm.askDelete(vm.uiState.value.days.first().slots.first())
        vm.confirmDelete()
        assertEquals(repository.removeError, vm.uiState.value.actionError)
        assertEquals(2, repository.mySlotRequests.size)
    }
}
