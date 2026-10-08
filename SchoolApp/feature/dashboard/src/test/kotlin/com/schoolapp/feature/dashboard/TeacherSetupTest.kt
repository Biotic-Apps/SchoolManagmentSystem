package com.schoolapp.feature.dashboard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.dashboard.TeacherToday
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.dashboard.components.upcomingPeriods
import com.schoolapp.feature.dashboard.teacher.TeacherDayLoader
import com.schoolapp.feature.dashboard.teacher.TeacherSetup
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDateTime

class TeacherSetupTest {

    // Tuesday 6 Oct 2026, 9:00 AM.
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) }
    private val repository = FakeDashboardRepository()
    private val section = Section("s1", "c5", "Class 5", "A", null, null, 30, null)

    private fun load(sections: List<Section>, week: List<TeacherSlot> = emptyList(), table: SectionTimetable? = null) = runTest {
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER))
        val timetables = FakeTimetableRepository(week).apply { section = table }
        result = TeacherDayLoader(repository, TodayPeriodsLoader(timetables, clock), ScopedSections(auth, organisationWith(sections)), clock).load()
    }

    private var result = com.schoolapp.feature.dashboard.teacher.TeacherDay(emptyList())

    private fun table(state: TimetableState) = SectionTimetable("s1", null, 0, null, emptyList(), emptyList(), state)

    private fun slot(index: Int, start: String, end: String) =
        TeacherSlot("2026-10-06", 2, index, start, end, "A", "Class 5", "Maths", null, null, false)

    @Test
    fun teacher_without_sections_gets_the_onboarding_state() {
        repository.teacherResult = AppResult.Success(TeacherToday(emptyList(), emptyList(), emptyList(), 0, 0))
        load(sections = emptyList())
        assertEquals(TeacherSetup.NOT_ASSIGNED, result.setup)
        assertFalse(result.hasDiariesDue)
    }

    @Test
    fun assigned_teacher_with_unpublished_timetable_is_told_so() {
        repository.teacherResult = AppResult.Success(TeacherToday(emptyList(), emptyList(), emptyList(), 0, 0))
        load(sections = listOf(section), table = table(TimetableState.DRAFT))
        assertEquals(TeacherSetup.NOT_PUBLISHED, result.setup)

        load(sections = listOf(section), table = table(TimetableState.PUBLISHED))
        assertEquals(TeacherSetup.READY, result.setup)
    }

    @Test
    fun periods_mark_now_next_and_hide_past() {
        repository.teacherResult = AppResult.Success(
            TeacherToday(
                listOf(slot(1, "08:00", "08:40"), slot(2, "08:40", "09:20"), slot(3, "09:20", "10:00"), slot(4, "10:00", "10:40")),
                emptyList(), emptyList(), 0, 0,
            ),
        )
        load(sections = listOf(section))
        assertEquals(TeacherSetup.READY, result.setup)
        assertTrue(result.hasDiariesDue)
        val shown = upcomingPeriods(result.periods)
        assertEquals(listOf(2, 3, 4), shown.map { it.periodIndex })
        assertTrue(shown[0].isCurrent)
        assertTrue(shown[1].isNext)
        assertFalse(shown[2].isNext)
    }

    @Test
    fun greeting_skips_initials_and_titles() {
        assertEquals("Ayesha", greetingName("T Ayesha 2"))
        assertEquals("Sana", greetingName("Ms. Sana Khan"))
        assertEquals("Imran", greetingName("Imran Ali"))
        assertEquals("A B", greetingName("A B"))
        assertEquals("Emaan", greetingName("Mam Emaan"))
        assertEquals("Emaan", greetingName("Ma'am Emaan"))
        assertEquals("Fatima", greetingName("Madam Fatima"))
        assertEquals("Ahmed", greetingName("Sir Ahmed Raza"))
        assertEquals("Hina", greetingName("Prof. Dr. Hina"))
        assertEquals("Zara", greetingName("Miss Zara"))
        assertEquals("Ali", greetingName("Mr M. Ali"))
    }
}
