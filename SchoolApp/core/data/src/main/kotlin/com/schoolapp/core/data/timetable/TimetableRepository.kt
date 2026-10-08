package com.schoolapp.core.data.timetable

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.timetable.OverrideInput
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableOverride

interface TimetableRepository {
    /** Teacher/helper: own week incl. substitutions. Parent: pass [studentId] for the child's section. */
    suspend fun myWeek(weekOf: String? = null, studentId: String? = null): AppResult<List<TeacherSlot>>

    /** Supervisors: the section's current (published) timetable. */
    suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable>

    /** Supervisors (`timetable.view`): the branch's substitutions on [date] (`YYYY-MM-DD`), by period. */
    suspend fun overrides(branchId: String, date: String): AppResult<List<TimetableOverride>>

    /** `timetable.edit`: cover one published period with a substitute, who is notified. */
    suspend fun assignSubstitute(input: OverrideInput): AppResult<TimetableOverride>

    /** `timetable.edit`: the period goes back to the timetabled teacher. */
    suspend fun removeOverride(id: String): AppResult<Unit>
}
