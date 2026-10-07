package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.calendar.DefaultStudentCalendarRepository
import com.schoolapp.core.data.calendar.StudentCalendarRepository
import com.schoolapp.core.model.organisation.CalendarEvent
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareStudentCalendarRepository @Inject constructor(
    private val real: DefaultStudentCalendarRepository,
    private val auth: DemoAwareAuthRepository,
) : StudentCalendarRepository {

    override suspend fun upcoming(studentId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> {
        if (!auth.isDemoActive) return real.upcoming(studentId, from, to)
        return AppResult.Success(DemoCalendarData.upcoming())
    }
}
