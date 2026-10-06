package com.schoolapp.core.data.activities

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ConsentStatus

interface ActivitiesRepository {
    suspend fun activities(branchId: String? = null, status: ActivityStatus? = null, from: String? = null, to: String? = null): AppResult<List<Activity>>

    /** Parent: upcoming activities for the child with their consent state. */
    suspend fun forChild(studentId: String): AppResult<List<Activity>>

    suspend fun activity(id: String): AppResult<Activity>
    suspend fun propose(input: ActivityInput): AppResult<Activity>
    suspend fun approve(id: String, comment: String?): AppResult<Activity>
    suspend fun reject(id: String, comment: String?): AppResult<Activity>
    suspend fun consents(id: String): AppResult<List<ActivityConsent>>

    /** Parent decision; only GRANTED or DECLINED, before the deadline. */
    suspend fun decideConsent(id: String, studentId: String, decision: ConsentStatus, note: String?): AppResult<Unit>

    suspend fun participants(id: String): AppResult<List<ActivityParticipant>>
}
