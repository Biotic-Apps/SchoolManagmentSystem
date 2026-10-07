package com.schoolapp.core.data.calendar

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.toModel
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.OrganisationApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStudentCalendarRepository @Inject constructor(
    private val api: OrganisationApi,
    private val apiCaller: ApiCaller,
) : StudentCalendarRepository {

    override suspend fun upcoming(studentId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> =
        apiCaller.call {
            api.studentCalendar(studentId, from, to).data
                .map { it.toModel() }
                .sortedWith(compareBy({ it.startDate.orEmpty() }, { it.title }))
        }
}
