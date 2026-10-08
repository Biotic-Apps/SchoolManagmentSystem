package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.BellSchedule

/** The branch's time slots, used to show breaks and free periods around a teacher's or child's lessons. */
interface BellScheduleRepository {
    suspend fun schedule(branchId: String): AppResult<BellSchedule>
}
