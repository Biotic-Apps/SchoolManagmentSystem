package com.schoolapp.core.data.staff

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.ClassAllocation

/** Class / subject teacher allocation per section (`staff.edit` or `timetable.edit`, managing the branch). */
interface AllocationRepository {
    suspend fun classAllocation(classId: String, branchId: String): AppResult<ClassAllocation>
    suspend fun setClassTeacher(sectionId: String, staffId: String): AppResult<Unit>
    suspend fun setSubjectTeacher(sectionId: String, subjectId: String, staffId: String): AppResult<Unit>
}
