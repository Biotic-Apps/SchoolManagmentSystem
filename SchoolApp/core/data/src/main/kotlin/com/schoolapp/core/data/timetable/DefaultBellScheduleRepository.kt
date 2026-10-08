package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.TimetableApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultBellScheduleRepository @Inject constructor(
    private val api: TimetableApi,
    private val apiCaller: ApiCaller,
) : BellScheduleRepository {

    override suspend fun schedule(branchId: String): AppResult<BellSchedule> {
        val result = apiCaller.call {
            val dto = api.bellSchedule(branchId).data
            BellSchedule(dto.workingDays.sorted(), dto.default.toSchedule(), dto.days.toDaySchedules())
        }
        val error = (result as? AppResult.Failure)?.error
        if (error !is AppError.Server || error.httpCode != HTTP_NOT_FOUND) return result
        // Older server without bell-schedule: default rows only, working days unknown.
        return apiCaller.call { BellSchedule(emptyList(), api.periods(branchId).data.toSchedule()) }
    }

    private companion object {
        const val HTTP_NOT_FOUND = 404
    }
}
