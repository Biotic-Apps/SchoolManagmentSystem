package com.schoolapp.feature.meetings

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.meetings.book.BookMeetingViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class BookMeetingViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeMeetingsRepository()
    private val auth = FakeAuthRepository(
        TestSessions.session(RoleKey.PARENT, "meetings.view", branchId = null)
            .copy(children = listOf(ChildSummary("c1", "Ali Khan")), activeChildId = "c1"),
    )

    private fun viewModel() = BookMeetingViewModel(repository, auth, AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) })

    @Test
    fun loads_next_14_days_grouped_by_date() {
        val vm = viewModel()
        assertEquals("2026-10-06" to "2026-10-19", repository.slotRequests.single())
        val days = vm.uiState.value.days
        assertEquals(listOf("2026-10-08", "2026-10-09"), days.map { it.date })
        assertEquals(listOf("s1", "s2"), days.first().slots.map { it.id })
    }

    @Test
    fun agenda_is_required() {
        val vm = viewModel()
        vm.onSlotSelected("s1")
        vm.book()
        assertTrue(vm.uiState.value.agendaMissing)
        assertTrue(repository.bookings.isEmpty())
    }

    @Test
    fun conflict_clears_selection_shows_message_and_refreshes_slots() {
        val vm = viewModel()
        vm.onSlotSelected("s1")
        vm.onAgendaChange("Reading progress")
        repository.bookError = AppError.Server(409, "SLOT_TAKEN", "Slot already booked")
        repository.slots = listOf(slot("s2", start = "10:00"))
        vm.book()
        val state = vm.uiState.value
        assertTrue(state.slotTaken)
        assertNull(state.selected)
        assertFalse(state.booked)
        assertEquals(2, repository.slotRequests.size)
        assertEquals(listOf("s2"), state.days.flatMap { it.slots }.map { it.id })
        assertEquals("Reading progress", state.agenda)
    }

    @Test
    fun successful_booking_uses_active_child() {
        val vm = viewModel()
        vm.onSlotSelected("s3")
        vm.onAgendaChange("  Homework  ")
        vm.book()
        assertTrue(vm.uiState.value.booked)
        assertEquals(Triple("s3", "c1", "Homework"), repository.bookings.single())
    }

    @Test
    fun other_errors_keep_selection() {
        val vm = viewModel()
        vm.onSlotSelected("s1")
        vm.onAgendaChange("Progress")
        repository.bookError = AppError.Network
        vm.book()
        val state = vm.uiState.value
        assertEquals("s1", state.selected?.id)
        assertEquals(AppError.Network, state.bookError)
        assertFalse(state.slotTaken)
    }
}
