package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.calendar.StudentCalendarRepository
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.timetable.calendar.SchoolCalendarViewModel
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class SchoolCalendarViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 7, 8, 0) }
    private val holiday = CalendarEvent("e1", "HOLIDAY", "Founders' Day", "2026-10-20", "2026-10-20", "School closed")
    private val vacation = CalendarEvent("e2", "VACATION", "Winter vacation", "2026-12-22", "2027-01-02", null)
    private val repository = FakeStudentCalendarRepository(mapOf("c1" to listOf(holiday, vacation), "c2" to listOf(vacation)))
    private val parent = FakeAuthRepository(
        TestSessions.session(RoleKey.PARENT, "timetable.view").copy(
            children = listOf(ChildSummary("c1", "Ayesha Khan"), ChildSummary("c2", "Omar Khan")),
            activeChildId = "c1",
        ),
    )

    @Test
    fun loads_today_to_plus_90_days_for_the_active_child() {
        val vm = SchoolCalendarViewModel(parent, repository, clock)
        val state = vm.uiState.value
        assertFalse(state.isLoading)
        assertEquals(listOf("e1", "e2"), state.events.map { it.id })
        assertEquals(90, state.days)
        assertEquals(listOf(Triple("c1", "2026-10-07", "2027-01-05")), repository.calls)
    }

    @Test
    fun child_switch_reloads_the_calendar() = runTest {
        val vm = SchoolCalendarViewModel(parent, repository, clock)
        parent.selectChild("c2")
        assertEquals("Omar Khan", vm.uiState.value.childName)
        assertEquals(listOf("e2"), vm.uiState.value.events.map { it.id })
        assertEquals(listOf("c1", "c2"), repository.calls.map { it.first })
    }

    @Test
    fun error_then_retry_and_pull_to_refresh() {
        repository.error = AppError.Server(404, "NOT_FOUND", null)
        val vm = SchoolCalendarViewModel(parent, repository, clock)
        assertEquals(AppError.Server(404, "NOT_FOUND", null), vm.uiState.value.error)

        repository.error = null
        vm.retry()
        assertNull(vm.uiState.value.error)
        assertEquals(2, vm.uiState.value.events.size)

        vm.refresh()
        assertFalse(vm.uiState.value.isRefreshing)
        assertEquals(3, repository.calls.size)
    }

    @Test
    fun no_child_shows_empty_without_loading() {
        val vm = SchoolCalendarViewModel(FakeAuthRepository(TestSessions.session(RoleKey.PARENT)), repository, clock)
        assertNull(vm.uiState.value.childId)
        assertFalse(vm.uiState.value.isLoading)
        assertTrue(repository.calls.isEmpty())
    }

    private class FakeStudentCalendarRepository(private val events: Map<String, List<CalendarEvent>>) : StudentCalendarRepository {
        val calls = mutableListOf<Triple<String, String?, String?>>()
        var error: AppError? = null
        override suspend fun upcoming(studentId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> {
            calls += Triple(studentId, from, to)
            return error?.let { AppResult.Failure(it) } ?: AppResult.Success(events[studentId].orEmpty())
        }
    }
}
