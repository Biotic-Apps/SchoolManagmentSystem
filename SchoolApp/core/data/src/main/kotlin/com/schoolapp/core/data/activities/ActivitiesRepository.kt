package com.schoolapp.core.data.activities

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityFilter
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.core.model.settings.PagedList

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

    /** One page of the branch's activities (server paging, default 20). */
    suspend fun activitiesPage(branchId: String?, filter: ActivityFilter, page: Int, pageSize: Int = PAGE_SIZE): AppResult<PagedList<Activity>>

    /** Edit a PROPOSED activity. */
    suspend fun update(id: String, input: ActivityInput): AppResult<Activity>

    /** ONGOING, COMPLETED or CANCELLED ([reason] for cancel). */
    suspend fun setStatus(id: String, status: ActivityStatus, reason: String?): AppResult<Activity>

    /** Replaces the whole roster (role, result, position, remarks). */
    suspend fun saveParticipants(id: String, participants: List<ActivityParticipant>): AppResult<List<ActivityParticipant>>

    companion object {
        const val PAGE_SIZE = 20
    }
}
