package com.schoolapp.core.data.calendar

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.organisation.CalendarEvent

/** The school calendar as seen by a parent for one child (`GET /students/:studentId/calendar`). */
interface StudentCalendarRepository {
    /** Events overlapping [from]..[to] (ISO dates; server default today..+90 days), earliest first. */
    suspend fun upcoming(studentId: String, from: String? = null, to: String? = null): AppResult<List<CalendarEvent>>
}
