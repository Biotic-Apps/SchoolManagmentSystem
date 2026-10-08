package com.schoolapp.feature.timetable

import com.schoolapp.core.model.organisation.CalendarEvent
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalTime

class DayPlannerTest {

    private val lessons = ScheduleBuilder.fromSlots(
        listOf(teacherSlot(1, 2, "08:40", "09:20"), teacherSlot(1, 9, "13:00", "13:40", number = null)),
        showTeacher = false,
    )

    @Test
    fun merge_fills_free_and_break_rows_and_keeps_unknown_lessons_in_time_order() {
        val rows = DayPlanner.merge(1, Bell.default, lessons)
        assertEquals(listOf(1, 2, 3, 4, 9), rows.map { it.periodIndex })
        assertEquals(listOf(RowKind.FREE, RowKind.LESSON, RowKind.BREAK, RowKind.FREE, RowKind.LESSON), rows.map { it.kind })
        assertEquals(listOf(1, 2, null, 3, null), rows.map { it.periodNumber })
    }

    @Test
    fun without_a_bell_schedule_only_lessons_show_and_a_day_without_any_is_empty() {
        assertEquals(2, DayPlanner.merge(1, emptyList(), lessons).size)
        assertTrue(DayPlanner.merge(2, emptyList(), emptyList()).isEmpty())
    }

    @Test
    fun now_and_next_markers() {
        val rows = DayPlanner.merge(1, Bell.default, lessons)
        val inBreak = DayPlanner.markers(rows, LocalTime.of(9, 25))
        assertEquals(RowMarker.NOW, inBreak["1-3-BREAK"])
        assertEquals(RowMarker.NEXT, inBreak["1-9-LESSON"])
        val inLesson = DayPlanner.markers(rows, LocalTime.of(8, 40))
        assertEquals(mapOf("1-2-LESSON" to RowMarker.NOW, "1-9-LESSON" to RowMarker.NEXT), inLesson)
        assertTrue(DayPlanner.markers(rows, LocalTime.of(15, 0)).isEmpty())
    }

    @Test
    fun week_status_free_holiday_and_no_school() {
        val week = WeekDates.forToday(LocalDate.of(2026, 10, 7))
        val sundayLesson = ScheduleBuilder.fromSlots(listOf(teacherSlot(7, 1, "08:00", "08:40")), showTeacher = false)
        val plans = DayPlanner.week(
            lessons = lessons + sundayLesson,
            workingDays = (1..5).toList(),
            periodsFor = { Bell.default },
            dateFor = week::dateFor,
            holidays = mapOf(LocalDate.of(2026, 10, 6) to "Iqbal Day"),
        )
        assertEquals(listOf(1, 2, 3, 4, 5, 7), plans.map { it.day })
        assertEquals(DayStatus.LESSONS, plans[0].status)
        assertEquals(DayStatus.HOLIDAY, plans[1].status)
        assertEquals(DayStatus.FREE_DAY, plans[2].status)
        assertEquals(DayStatus.LESSONS, plans[5].status)
        assertEquals(LocalDate.of(2026, 10, 5), plans[0].date)
    }

    @Test
    fun holidays_span_the_week_and_ignore_events() {
        val week = WeekDates(LocalDate.of(2026, 12, 21))
        val events = listOf(
            CalendarEvent("v", "VACATION", "Winter vacation", "2026-12-24", "2027-01-02", null),
            CalendarEvent("e", "EVENT", "Sports day", "2026-12-21", "2026-12-21", null),
        )
        val closed = WeekHolidays.byDate(events, week)
        assertEquals((24..27).map { LocalDate.of(2026, 12, it) }.toSet(), closed.keys)
    }

    @Test
    fun time_range_writes_am_pm_once_when_shared() {
        assertEquals("9:20 – 10:00 AM", ScheduleBuilder.timeRange("09:20", "10:00"))
        assertEquals("11:40 AM – 12:20 PM", ScheduleBuilder.timeRange("11:40", "12:20"))
        assertEquals("1:00 – 1:40 PM", ScheduleBuilder.timeRange("13:00", "13:40"))
        assertEquals("8:00 AM", ScheduleBuilder.timeRange("08:00", null))
    }
}
