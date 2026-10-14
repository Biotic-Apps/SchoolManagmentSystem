package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.TimetableApi
import javax.inject.Inject
import javax.inject.Singleton

/** Supervisors' "Teacher week": any teacher's published lessons and substitute periods for one week. */
@Singleton
class TeacherTimetableRepository @Inject constructor(
    private val api: TimetableApi,
    private val apiCaller: ApiCaller,
) {
    /** [weekOf] is any date of the wanted week (`YYYY-MM-DD`). */
    suspend fun week(staffId: String, weekOf: String): AppResult<List<TeacherSlot>> =
        apiCaller.call {
            api.teacher(staffId, weekOf).data.map { it.toModel() }.sortedWith(compareBy({ it.day }, { it.periodIndex }))
        }
}
