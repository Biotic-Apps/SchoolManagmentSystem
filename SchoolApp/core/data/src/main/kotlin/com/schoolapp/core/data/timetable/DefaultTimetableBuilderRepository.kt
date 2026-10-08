package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.BellScheduleInput
import com.schoolapp.core.model.timetable.LessonInput
import com.schoolapp.core.model.timetable.LessonSaveResult
import com.schoolapp.core.model.timetable.TimetableBuilder
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.TimetableEditApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultTimetableBuilderRepository @Inject constructor(
    private val api: TimetableEditApi,
    private val apiCaller: ApiCaller,
) : TimetableBuilderRepository {

    override suspend fun builder(sectionId: String): AppResult<TimetableBuilder> =
        apiCaller.call { api.builder(sectionId).data.toModel() }

    override suspend fun saveLesson(sectionId: String, day: Int, periodIndex: Int, input: LessonInput): AppResult<LessonSaveResult> =
        apiCaller.call { api.saveLesson(sectionId, day, periodIndex, input.toRequest()).data.toModel() }

    override suspend fun removeLesson(sectionId: String, day: Int, periodIndex: Int): AppResult<LessonSaveResult> =
        apiCaller.call { api.removeLesson(sectionId, day, periodIndex).data.toModel() }

    override suspend fun publish(sectionId: String): AppResult<Unit> = apiCaller.call { api.publish(sectionId) }.map { }

    override suspend fun discard(sectionId: String): AppResult<Unit> = apiCaller.call { api.discard(sectionId) }.map { }

    override suspend fun saveBellSchedule(branchId: String, input: BellScheduleInput): AppResult<BellSchedule> =
        apiCaller.call {
            val dto = api.saveBellSchedule(branchId, input.toRequest()).data
            BellSchedule(dto.workingDays.sorted(), dto.default.toSchedule(), dto.days.toDaySchedules())
        }
}
