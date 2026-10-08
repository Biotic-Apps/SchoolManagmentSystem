package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TimetableSlot
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class TimetableViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val timetables = FakeTimetables()
    private val org = OrgAnswers().apply { sections = listOf(section()) }
    private fun teacher() = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "timetable.view"))

    private fun sectionTable(state: TimetableState, canEdit: Boolean = false, version: Int = 0) = SectionTimetable(
        "s1", null, version, null,
        listOf(TimetableSlot(1, 4, "Urdu", "Hina", null), TimetableSlot(5, 2, "Maths", "Omar", "R-1")),
        Bell.default, state, mapOf(5 to Bell.friday), canEdit,
    )

    @Test
    fun teacher_week_shows_breaks_free_periods_and_now_next() {
        timetables.week = listOf(teacherSlot(1, 1, "08:00", "08:40"), teacherSlot(1, 4, "09:40", "10:20", number = 3, sub = true))
        val state = timetableViewModel(teacher(), timetables, clockAt(1, 8, 10), org).uiState.value

        assertEquals(TimetableStatus.CONTENT, state.status)
        assertEquals((1..6).toList(), state.days.map { it.day })
        assertEquals(1, state.selectedDay)
        assertEquals(listOf(RowKind.LESSON, RowKind.FREE, RowKind.BREAK, RowKind.LESSON), state.dayRows.map { it.kind })
        assertEquals(2, state.selectedPlan!!.lessonCount)
        assertEquals("8:00 – 8:40 AM", state.dayRows[0].timeRange)
        assertEquals(RowMarker.NOW, state.markerFor(state.dayRows[0]))
        assertEquals(RowMarker.NEXT, state.markerFor(state.dayRows[3]))
        assertEquals("Class 5 · A", state.dayRows[0].subtitle)
        assertEquals(listOf<String?>("2026-10-05"), timetables.weeksOf)
        // Tuesday has the bell schedule but no lessons: a free day, not "not published".
        assertEquals(DayStatus.FREE_DAY, state.days[1].status)
        // Friday uses its own shorter schedule.
        assertEquals(listOf("08:00", "08:35"), state.days[4].rows.map { it.startTime })
    }

    @Test
    fun sunday_shows_next_week_from_monday() {
        timetables.week = listOf(teacherSlot(1, 1, "08:00", "08:40"))
        val state = timetableViewModel(teacher(), timetables, clockAt(7, 10, 0), org).uiState.value
        assertEquals(1, state.selectedDay)
        assertNull(state.today)
        assertEquals("2026-10-12", state.days.first().date.toString())
        assertEquals(listOf<String?>("2026-10-12"), timetables.weeksOf)
        assertTrue(state.markers.isEmpty() || state.markerFor(state.dayRows[0]) == null)
    }

    @Test
    fun teacher_without_sections_is_not_assigned() {
        org.sections = emptyList()
        val state = timetableViewModel(teacher(), timetables, clockAt(1, 9, 0), org).uiState.value
        assertEquals(TimetableStatus.NOT_ASSIGNED, state.status)
        assertFalse(state.hasWeek)
    }

    @Test
    fun teacher_with_sections_but_nothing_published_is_not_published() {
        timetables.sections = mapOf("s1" to sectionTable(TimetableState.DRAFT))
        val state = timetableViewModel(teacher(), timetables, clockAt(1, 9, 0), org).uiState.value
        assertEquals(TimetableStatus.NOT_PUBLISHED, state.status)
    }

    @Test
    fun teacher_with_published_timetable_but_no_lessons_sees_free_days() {
        timetables.sections = mapOf("s1" to sectionTable(TimetableState.PUBLISHED))
        val state = timetableViewModel(teacher(), timetables, clockAt(1, 9, 0), org).uiState.value
        assertEquals(TimetableStatus.CONTENT, state.status)
        assertEquals(DayStatus.FREE_DAY, state.selectedPlan!!.status)
    }

    @Test
    fun holiday_from_the_calendar_marks_the_day() {
        org.events = listOf(CalendarEvent("h", "HOLIDAY", "Iqbal Day", "2026-10-07", "2026-10-07", null))
        timetables.week = listOf(teacherSlot(1, 1, "08:00", "08:40"))
        val state = timetableViewModel(teacher(), timetables, clockAt(1, 9, 0), org).uiState.value
        assertEquals(DayStatus.HOLIDAY, state.days[2].status)
        assertEquals("Iqbal Day", state.days[2].holiday)
    }

    @Test
    fun my_sections_shows_published_hides_drafts_and_notes_class_teacher_drafts() {
        timetables.week = listOf(teacherSlot(5, 2, "08:35", "09:10", number = 2))
        timetables.sections = mapOf("s1" to sectionTable(TimetableState.PUBLISHED, version = 2))
        val vm = timetableViewModel(teacher(), timetables, clockAt(5, 8, 0), org)
        assertEquals(TeacherView.WEEK, vm.uiState.value.teacherView)

        vm.onTeacherViewSelected(TeacherView.SECTIONS)
        var state = vm.uiState.value
        assertTrue(state.showsSections)
        assertEquals(TimetableStatus.CONTENT, state.status)
        assertNull(state.stateChip)
        assertEquals("8:35 – 9:10 AM", state.dayRows.first { it.isLesson }.timeRange)

        timetables.sections = mapOf("s1" to sectionTable(TimetableState.DRAFT))
        vm.onSectionSelected("s1")
        assertEquals(TimetableStatus.NOT_PUBLISHED, vm.uiState.value.status)

        timetables.sections = mapOf("s1" to sectionTable(TimetableState.DRAFT, canEdit = true))
        vm.onSectionSelected("s1")
        state = vm.uiState.value
        assertEquals(TimetableStatus.CONTENT, state.status)
        assertTrue(state.draftNote)

        vm.onTeacherViewSelected(TeacherView.WEEK)
        assertFalse(vm.uiState.value.showsSections)
        assertFalse(vm.uiState.value.draftNote)
    }

    @Test
    fun principal_sees_drafts_with_state_chip_and_empty_as_not_created() {
        timetables.sections = mapOf("s1" to sectionTable(TimetableState.DRAFT))
        val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "timetable.view"))
        val vm = timetableViewModel(principal, timetables, clockAt(1, 9, 0), org)
        assertEquals(TimetableMode.SECTION, vm.uiState.value.mode)
        assertEquals(TimetableState.DRAFT, vm.uiState.value.stateChip)

        timetables.sections = mapOf("s1" to SectionTimetable("s1", null, 0, null, emptyList(), Bell.default, TimetableState.EMPTY))
        vm.onSectionSelected("s1")
        assertEquals(TimetableStatus.NOT_CREATED, vm.uiState.value.status)
        assertNull(vm.uiState.value.stateChip)
    }

    @Test
    fun parent_view_follows_the_child_and_shows_not_published_when_empty() {
        val children = listOf(ChildSummary("c1", "Ayesha", "Class 5", "A"), ChildSummary("c2", "Omar", "Class 4", "B"))
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.PARENT).copy(children = children, activeChildId = "c1"))
        val vm = timetableViewModel(auth, timetables, clockAt(1, 8, 10), org)
        assertEquals(TimetableMode.CHILD, vm.uiState.value.mode)
        assertEquals(TimetableStatus.NOT_PUBLISHED, vm.uiState.value.status)
        assertTrue(vm.uiState.value.subtitle!!.startsWith("Ayesha"))

        timetables.week = listOf(teacherSlot(1, 1, "08:00", "08:40"))
        auth.sessionState.value = auth.sessionState.value!!.copy(activeChildId = "c2")
        assertEquals(listOf<String?>("c1", "c2"), timetables.studentIds)
        assertEquals(TimetableStatus.CONTENT, vm.uiState.value.status)
        assertEquals("Demo Teacher", vm.uiState.value.dayRows.single().subtitle)
    }

    @Test
    fun errors_retry_and_refresh_keeps_the_selected_day() {
        timetables.failure = AppError.Network
        val vm = timetableViewModel(teacher(), timetables, clockAt(1, 9, 0), org)
        assertEquals(AppError.Network, vm.uiState.value.error)

        timetables.failure = null
        timetables.week = listOf(teacherSlot(1, 1, "08:00", "08:40"))
        vm.retry()
        assertNull(vm.uiState.value.error)
        vm.onDaySelected(3)
        vm.refresh()
        assertEquals(3, vm.uiState.value.selectedDay)
        assertFalse(vm.uiState.value.isRefreshing)
    }

    @Test
    fun lesson_sheet_opens_for_lessons_only() {
        timetables.week = listOf(teacherSlot(1, 1, "08:00", "08:40"))
        val vm = timetableViewModel(teacher(), timetables, clockAt(1, 9, 0), org)
        val rows = vm.uiState.value.dayRows
        vm.onLessonSelected(rows.first { it.kind == RowKind.FREE })
        assertNull(vm.uiState.value.openLesson)
        vm.onLessonSelected(rows.first { it.isLesson })
        assertEquals("Mathematics", vm.uiState.value.openLesson?.title)
        vm.onLessonSelected(null)
        assertNull(vm.uiState.value.openLesson)
    }

    @Test
    fun helper_has_no_sections_switch() {
        val vm = timetableViewModel(FakeAuthRepository(TestSessions.session(RoleKey.HELPER)), timetables, clockAt(1, 9, 0), org)
        assertNull(vm.uiState.value.teacherView)
    }
}
