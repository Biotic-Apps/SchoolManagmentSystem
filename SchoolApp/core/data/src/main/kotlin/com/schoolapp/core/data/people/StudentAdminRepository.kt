package com.schoolapp.core.data.people

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.people.ApplicationInput
import com.schoolapp.core.model.people.EnrollmentChange
import com.schoolapp.core.model.people.GuardianInput
import com.schoolapp.core.model.people.LinkGuardianInput
import com.schoolapp.core.model.people.RegisterStudentInput
import com.schoolapp.core.model.people.RegisteredStudent
import com.schoolapp.core.model.people.StudentUpdate

/**
 * Writes behind the Students and Admissions screens: `students.add` (register), `students.edit` (edit,
 * withdraw, change section, transfer, link guardian), `guardians.edit`, `admissions.add`.
 */
interface StudentAdminRepository {
    suspend fun register(input: RegisterStudentInput): AppResult<RegisteredStudent>
    suspend fun update(studentId: String, update: StudentUpdate): AppResult<Unit>
    suspend fun changeEnrollment(studentId: String, change: EnrollmentChange): AppResult<Unit>
    suspend fun linkGuardian(studentId: String, input: LinkGuardianInput): AppResult<Unit>
    suspend fun updateGuardian(guardianId: String, input: GuardianInput): AppResult<Unit>

    /** Returns the new application's id. */
    suspend fun createApplication(input: ApplicationInput): AppResult<String>
}
