package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.timetable.DefaultTimetableRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareTimetableRepository @Inject constructor(
    private val real: DefaultTimetableRepository,
    private val auth: DemoAwareAuthRepository,
) : TimetableRepository {

    override suspend fun myWeek(weekOf: String?, studentId: String?): AppResult<List<TeacherSlot>> {
        if (!auth.isDemoActive) return real.myWeek(weekOf, studentId)
        if (studentId == null) return AppResult.Success(DemoTimetableData.teacherWeek)
        val child = DemoPeopleData.students.firstOrNull { it.id == studentId }
        return AppResult.Success(DemoTimetableData.childWeek(child?.sectionId, child?.className, child?.sectionName))
    }

    override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> =
        if (auth.isDemoActive) AppResult.Success(DemoTimetableData.section(sectionId)) else real.sectionTimetable(sectionId)
}
