package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.data.activities.DefaultActivitiesRepository
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ConsentStatus
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareActivitiesRepository @Inject constructor(
    private val real: DefaultActivitiesRepository,
    private val auth: DemoAwareAuthRepository,
) : ActivitiesRepository {

    override suspend fun activities(branchId: String?, status: ActivityStatus?, from: String?, to: String?): AppResult<List<Activity>> {
        if (!auth.isDemoActive) return real.activities(branchId, status, from, to)
        val list = DemoActivitiesData.activities.value.filter { activity ->
            val date = DemoDates.dateOf(activity.startAt).orEmpty()
            (status == null || activity.status == status) && DemoDates.inRange(date, from, to)
        }
        return AppResult.Success(list.sortedByDescending { it.startAt })
    }

    override suspend fun forChild(studentId: String): AppResult<List<Activity>> =
        if (auth.isDemoActive) AppResult.Success(demoForChild(studentId)) else real.forChild(studentId)

    override suspend fun activity(id: String): AppResult<Activity> {
        if (!auth.isDemoActive) return real.activity(id)
        return find(id)
    }

    override suspend fun propose(input: ActivityInput): AppResult<Activity> {
        if (!auth.isDemoActive) return real.propose(input)
        val activity = Activity(
            id = "demo-act-${System.currentTimeMillis()}",
            type = input.type,
            title = input.title,
            description = input.description,
            startAt = toIso(input.startAt),
            endAt = toIso(input.endAt),
            venue = input.venue,
            status = ActivityStatus.PROPOSED,
            consentRequired = input.consentRequired,
            consentDeadline = input.consentDeadline,
            feeMinor = null,
            maxParticipants = null,
            audienceLabel = if (input.wholeBranch) "Whole branch" else input.sectionIds.mapNotNull(DemoActors::sectionLabel).joinToString(),
            proposedBy = DemoActors.forRole(auth.demoSession.value?.activeRole).name,
        )
        DemoActivitiesData.activities.update { listOf(activity) + it }
        DemoActivitiesData.audience.update { it + (activity.id to if (input.wholeBranch) null else input.sectionIds.toSet()) }
        return AppResult.Success(activity)
    }

    override suspend fun approve(id: String, comment: String?): AppResult<Activity> =
        if (auth.isDemoActive) setStatus(id, ActivityStatus.APPROVED) else real.approve(id, comment)

    override suspend fun reject(id: String, comment: String?): AppResult<Activity> =
        if (auth.isDemoActive) setStatus(id, ActivityStatus.REJECTED) else real.reject(id, comment)

    override suspend fun consents(id: String): AppResult<List<ActivityConsent>> =
        if (auth.isDemoActive) AppResult.Success(DemoActivitiesData.consents.value[id].orEmpty()) else real.consents(id)

    override suspend fun decideConsent(id: String, studentId: String, decision: ConsentStatus, note: String?): AppResult<Unit> {
        if (!auth.isDemoActive) return real.decideConsent(id, studentId, decision, note)
        val student = DemoPeopleData.students.firstOrNull { it.id == studentId }
            ?: return AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
        DemoActivitiesData.consents.update { all ->
            val current = all[id].orEmpty().filterNot { it.studentId == studentId }
            val decided = ActivityConsent(studentId, student.name, DemoActors.parent.name, decision, DemoDates.isoNow())
            all + (id to current + decided)
        }
        return AppResult.Success(Unit)
    }

    override suspend fun participants(id: String): AppResult<List<ActivityParticipant>> =
        if (auth.isDemoActive) AppResult.Success(DemoActivitiesData.participants.value[id].orEmpty()) else real.participants(id)

    private fun find(id: String): AppResult<Activity> =
        DemoActivitiesData.activities.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))

    private fun setStatus(id: String, status: ActivityStatus): AppResult<Activity> {
        DemoActivitiesData.activities.update { list -> list.map { if (it.id == id) it.copy(status = status) else it } }
        return find(id)
    }

    /** `yyyy-MM-ddTHH:mm` local input -> ISO instant like the server returns. */
    private fun toIso(local: String): String = runCatching {
        java.time.LocalDateTime.parse(local).atZone(java.time.ZoneId.systemDefault()).toInstant().toString()
    }.getOrDefault(local)

    internal companion object {
        private val visibleToParents = setOf(ActivityStatus.APPROVED, ActivityStatus.ANNOUNCED, ActivityStatus.ONGOING, ActivityStatus.COMPLETED)

        /** Activities for the child's section with that child's consent state. */
        fun demoForChild(studentId: String): List<Activity> {
            val sectionId = DemoPeopleData.students.firstOrNull { it.id == studentId }?.sectionId
            val audience = DemoActivitiesData.audience.value
            return DemoActivitiesData.activities.value
                .filter { it.status in visibleToParents && audience[it.id].let { sections -> sections == null || (sectionId != null && sectionId in sections) } }
                .map { activity ->
                    val consent = DemoActivitiesData.consents.value[activity.id].orEmpty().firstOrNull { it.studentId == studentId }
                    activity.copy(
                        myConsent = if (activity.consentRequired) consent?.status ?: ConsentStatus.PENDING else null,
                        studentId = studentId,
                    )
                }
                .sortedBy { it.startAt }
        }
    }
}
