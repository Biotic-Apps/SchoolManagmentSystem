package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.OverrideInput
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableOverride
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.TimetableApi
import com.schoolapp.core.network.api.TimetableOverridesApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultTimetableRepository @Inject constructor(
    private val api: TimetableApi,
    private val apiCaller: ApiCaller,
    private val overridesApi: TimetableOverridesApi,
) : TimetableRepository {

    override suspend fun myWeek(weekOf: String?, studentId: String?): AppResult<List<TeacherSlot>> =
        apiCaller.call {
            api.mine(weekOf, studentId).data.map { it.toModel() }.sortedWith(compareBy({ it.day }, { it.periodIndex }))
        }

    override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> =
        apiCaller.call { api.section(sectionId).data.toModel() }

    override suspend fun overrides(branchId: String, date: String): AppResult<List<TimetableOverride>> =
        apiCaller.call {
            overridesApi.overrides(branchId, date).data.map { it.toModel() }.sortedWith(compareBy({ it.date }, { it.periodIndex }))
        }

    override suspend fun assignSubstitute(input: OverrideInput): AppResult<TimetableOverride> =
        apiCaller.call { overridesApi.create(input.toRequest()).data.toModel() }

    override suspend fun removeOverride(id: String): AppResult<Unit> =
        apiCaller.call {
            overridesApi.cancel(id)
            Unit
        }
}
