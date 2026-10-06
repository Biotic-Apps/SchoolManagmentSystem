package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.lang.reflect.Proxy
import java.time.LocalDateTime
import java.time.LocalTime

class TimetableViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private fun slot(day: Int, index: Int, start: String, end: String, sub: Boolean = false) =
        TeacherSlot(null, day, index, start, end, "A", "Class 5", "Mathematics", "Demo Teacher", "Room 12", sub)

    private val week = listOf(
        slot(1, 1, "08:00", "08:40"),
        slot(1, 2, "08:40", "09:20", sub = true),
        slot(1, 6, "13:00", "13:40"),
        slot(2, 1, "08:00", "08:40"),
    )

    private val repository = FakeTimetableRepository(week)

    // Monday 5 Oct 2026.
    private fun clockAt(hour: Int, minute: Int) = AppClock { LocalDateTime.of(2026, 10, 5, hour, minute) }

    private fun viewModel(auth: FakeAuthRepository, clock: AppClock) =
        TimetableViewModel(auth, repository, ScopedSections(auth, unusedOrganisation()), clock)

    @Test
    fun teacher_week_opens_on_today_with_running_period_and_12_hour_times() {
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "timetable.view")), clockAt(8, 45))
        val state = vm.uiState.value
        assertEquals(TimetableMode.MY_WEEK, state.mode)
        assertEquals(listOf(1, 2), state.days)
        assertEquals(1, state.selectedDay)
        assertEquals(2, state.highlightedPeriod)
        assertEquals("8:40 AM – 9:20 AM", state.dayRows[1].timeRange)
        assertEquals("1:00 PM – 1:40 PM", state.dayRows[2].timeRange)
        assertTrue(state.dayRows[1].isSubstitute)
        assertEquals(listOf<String?>(null), repository.studentIds.distinct())
    }

    @Test
    fun highlight_only_on_today_and_not_between_periods() {
        val vm = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.TEACHER)), clockAt(12, 0))
        assertNull(vm.uiState.value.currentPeriodIndex)
        val atNine = viewModel(FakeAuthRepository(TestSessions.session(RoleKey.TEACHER)), clockAt(8, 0))
        assertEquals(1, atNine.uiState.value.highlightedPeriod)
        atNine.onDaySelected(2)
        assertNull(atNine.uiState.value.highlightedPeriod)
    }

    @Test
    fun current_period_bounds_are_start_inclusive_end_exclusive() {
        val rows = ScheduleBuilder.fromSlots(week.filter { it.day == 1 }, showTeacher = false)
        assertEquals(1, ScheduleBuilder.currentPeriodIndex(rows, LocalTime.of(8, 0)))
        assertEquals(2, ScheduleBuilder.currentPeriodIndex(rows, LocalTime.of(8, 40)))
        assertNull(ScheduleBuilder.currentPeriodIndex(rows, LocalTime.of(9, 20)))
        assertEquals("12:00 AM – 12:30 PM", ScheduleBuilder.timeRange("00:00", "12:30"))
    }

    @Test
    fun parent_view_follows_the_child_switcher() {
        val children = listOf(ChildSummary("c1", "Ayesha", "Class 5", "A"), ChildSummary("c2", "Omar", "Class 4", "B"))
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.PARENT).copy(children = children, activeChildId = "c1"))
        val vm = viewModel(auth, clockAt(8, 10))
        assertEquals(TimetableMode.CHILD, vm.uiState.value.mode)
        assertEquals(listOf<String?>("c1"), repository.studentIds)
        assertTrue(vm.uiState.value.subtitle!!.startsWith("Ayesha"))

        auth.sessionState.value = auth.sessionState.value!!.copy(activeChildId = "c2")
        assertEquals(listOf<String?>("c1", "c2"), repository.studentIds)
        assertTrue(vm.uiState.value.subtitle!!.startsWith("Omar"))
    }

    private class FakeTimetableRepository(private val week: List<TeacherSlot>) : TimetableRepository {
        val studentIds = mutableListOf<String?>()
        override suspend fun myWeek(weekOf: String?, studentId: String?): AppResult<List<TeacherSlot>> {
            studentIds += studentId
            return AppResult.Success(week)
        }
        override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> = error("not used")
    }

    private fun unusedOrganisation(): OrganisationRepository = Proxy.newProxyInstance(
        OrganisationRepository::class.java.classLoader, arrayOf(OrganisationRepository::class.java),
    ) { _, _, _ -> error("not used") } as OrganisationRepository
}
