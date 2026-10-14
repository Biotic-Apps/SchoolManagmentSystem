package com.schoolapp.core.data.students.detail

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.students.detail.EnrollmentHistoryItem

/** Data behind the staff student profile tabs that the shared repositories do not cover. */
interface StudentDetailExtrasRepository {
    /** Newest placement first. */
    suspend fun enrollments(studentId: String): AppResult<List<EnrollmentHistoryItem>>

    /** `PUT /students/:id/health` (`health.edit`): replaces the whole profile; [HealthProfile.updatedAt] is ignored. */
    suspend fun replaceHealth(studentId: String, profile: HealthProfile): AppResult<HealthProfile>

    /** `pickup.edit`: the gate may release the student to this person. */
    suspend fun verifyPickupPerson(id: String): AppResult<PickupPerson>

    /** `pickup.edit`: the person is blocked at the gate. */
    suspend fun revokePickupPerson(id: String): AppResult<PickupPerson>
}
