package com.schoolapp.feature.activities

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.core.model.activity.ConsentStatus

internal fun activity(
    id: String = "a1",
    startAt: String = "2026-10-20T04:00:00.000Z",
    consentDeadline: String? = "2026-10-10",
    myConsent: ConsentStatus? = ConsentStatus.PENDING,
    status: ActivityStatus = ActivityStatus.ANNOUNCED,
) = Activity(
    id = id, type = ActivityType.TRIP, title = "Zoo trip", description = "Visit", startAt = startAt, endAt = null,
    venue = "Zoo", status = status, consentRequired = true, consentDeadline = consentDeadline, feeMinor = 150000,
    maxParticipants = null, audienceLabel = "Class 5", proposedBy = "Sara", myConsent = myConsent, studentId = "c1",
)

internal class FakeActivitiesRepository(var items: List<Activity> = listOf(activity())) : ActivitiesRepository {
    val decisions = mutableListOf<Triple<String, String, ConsentStatus>>()
    val proposals = mutableListOf<ActivityInput>()
    var forChildCalls = mutableListOf<String>()
    var decideError: AppError? = null

    override suspend fun activities(branchId: String?, status: ActivityStatus?, from: String?, to: String?) = AppResult.Success(items)

    override suspend fun forChild(studentId: String): AppResult<List<Activity>> {
        forChildCalls += studentId
        return AppResult.Success(items)
    }

    override suspend fun activity(id: String): AppResult<Activity> = AppResult.Success(items.first { it.id == id })

    override suspend fun propose(input: ActivityInput): AppResult<Activity> {
        proposals += input
        return AppResult.Success(activity(status = ActivityStatus.PROPOSED))
    }

    override suspend fun approve(id: String, comment: String?) = AppResult.Success(items.first().copy(status = ActivityStatus.ANNOUNCED))
    override suspend fun reject(id: String, comment: String?) = AppResult.Success(items.first().copy(status = ActivityStatus.REJECTED))
    override suspend fun consents(id: String): AppResult<List<ActivityConsent>> = AppResult.Success(emptyList())

    override suspend fun decideConsent(id: String, studentId: String, decision: ConsentStatus, note: String?): AppResult<Unit> {
        decideError?.let { return AppResult.Failure(it) }
        decisions += Triple(id, studentId, decision)
        return AppResult.Success(Unit)
    }

    override suspend fun participants(id: String): AppResult<List<ActivityParticipant>> = AppResult.Success(emptyList())
}
