package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot

interface TimetableRepository {
    /** Teacher/helper: own week incl. substitutions. Parent: pass [studentId] for the child's section. */
    suspend fun myWeek(weekOf: String? = null, studentId: String? = null): AppResult<List<TeacherSlot>>

    /** Supervisors: the section's current (published) timetable. */
    suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable>
}
