package com.schoolapp.demo

import com.schoolapp.core.model.organisation.CalendarEvent

/** Upcoming school calendar for the parent demo, relative to today. */
internal object DemoCalendarData {
    fun upcoming(): List<CalendarEvent> {
        val today = DemoDates.today()
        return listOf(
            CalendarEvent("demo-ce-1", "EVENT", "Parent-teacher meeting", today.plusDays(4).toString(), today.plusDays(4).toString(), "Meet class teachers, 9 AM to 12 PM"),
            CalendarEvent("demo-ce-2", "DEADLINE", "Science fair projects due", today.plusDays(11).toString(), today.plusDays(11).toString(), null),
            CalendarEvent("demo-ce-3", "HOLIDAY", "Founders' Day", today.plusDays(23).toString(), today.plusDays(23).toString(), "School closed"),
            CalendarEvent("demo-ce-4", "VACATION", "Winter vacation", today.plusDays(70).toString(), today.plusDays(81).toString(), null),
        )
    }
}
