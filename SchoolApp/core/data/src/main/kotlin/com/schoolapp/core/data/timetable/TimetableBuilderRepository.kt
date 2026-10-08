package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.BellScheduleInput
import com.schoolapp.core.model.timetable.LessonInput
import com.schoolapp.core.model.timetable.LessonSaveResult
import com.schoolapp.core.model.timetable.TimetableBuilder

/**
 * Timetable draft editing (`timetable.edit`; teachers only for their class-teacher sections) and bell
 * schedule changes. Each lesson is saved on its own; publish/discard need `timetable.publish`.
 */
interface TimetableBuilderRepository {
    suspend fun builder(sectionId: String): AppResult<TimetableBuilder>
    suspend fun saveLesson(sectionId: String, day: Int, periodIndex: Int, input: LessonInput): AppResult<LessonSaveResult>
    suspend fun removeLesson(sectionId: String, day: Int, periodIndex: Int): AppResult<LessonSaveResult>

    /** 409 NOTHING_TO_PUBLISH / TIMETABLE_CONFLICTS. */
    suspend fun publish(sectionId: String): AppResult<Unit>

    /** 409 NOTHING_TO_DISCARD. */
    suspend fun discard(sectionId: String): AppResult<Unit>

    /** 409 PERIODS_IN_USE (details = affected lessons) unless [BellScheduleInput.dropLessons]. */
    suspend fun saveBellSchedule(branchId: String, input: BellScheduleInput): AppResult<BellSchedule>
}
