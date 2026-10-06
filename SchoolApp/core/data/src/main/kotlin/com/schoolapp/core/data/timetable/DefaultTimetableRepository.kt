package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.TimetableApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultTimetableRepository @Inject constructor(
    private val api: TimetableApi,
    private val apiCaller: ApiCaller,
) : TimetableRepository {

    override suspend fun myWeek(weekOf: String?, studentId: String?): AppResult<List<TeacherSlot>> =
        apiCaller.call {
            api.mine(weekOf, studentId).data.map { it.toModel() }.sortedWith(compareBy({ it.day }, { it.periodIndex }))
        }

    override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> =
        apiCaller.call { api.section(sectionId).data.toModel() }
}
