package com.schoolapp.core.data.academics

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.academics.TeachingStaff

/** Class teacher and subject teacher per section; null staff removes the teacher. */
interface TeacherAllocationRepository {
    suspend fun teachingStaff(branchId: String, sessionId: String?): AppResult<List<TeachingStaff>>
    suspend fun setClassTeacher(sectionId: String, staffId: String?): AppResult<Unit>

    /** 403 OWN_ASSIGNMENT, 409 STAFF_LEFT, 400 SUBJECT_NOT_IN_CLASS / SUBJECT_NOT_IN_GROUP. */
    suspend fun setSubjectTeacher(sectionId: String, subjectId: String, staffId: String?): AppResult<Unit>
}
