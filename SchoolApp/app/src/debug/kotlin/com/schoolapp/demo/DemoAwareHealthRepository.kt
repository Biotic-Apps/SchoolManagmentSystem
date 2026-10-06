package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.health.DefaultHealthRepository
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.core.model.health.HealthChangeInput
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentInput
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareHealthRepository @Inject constructor(
    private val real: DefaultHealthRepository,
    private val auth: DemoAwareAuthRepository,
) : HealthRepository {

    override suspend fun profile(studentId: String): AppResult<HealthProfile> {
        if (!auth.isDemoActive) return real.profile(studentId)
        return DemoHealthData.profile(studentId)?.let { AppResult.Success(it) } ?: notFound()
    }

    override suspend fun requestChange(studentId: String, change: HealthChangeInput): AppResult<Unit> =
        if (auth.isDemoActive) AppResult.Success(Unit) else real.requestChange(studentId, change)

    override suspend fun alerts(sectionId: String): AppResult<List<HealthAlert>> {
        if (!auth.isDemoActive) return real.alerts(sectionId)
        val alerts = DemoPeopleData.students.filter { it.sectionId == sectionId }.mapNotNull { student ->
            val profile = DemoHealthData.profile(student.id) ?: return@mapNotNull null
            if (profile.allergies.isEmpty() && profile.conditions.isEmpty()) return@mapNotNull null
            HealthAlert(student.id, student.name, profile.allergies.map { it.name }, profile.conditions, profile.instructions)
        }
        return AppResult.Success(alerts)
    }

    override suspend fun incidents(studentId: String?, branchId: String?, from: String?, to: String?): AppResult<List<Incident>> {
        if (!auth.isDemoActive) return real.incidents(studentId, branchId, from, to)
        return AppResult.Success(demoIncidents(studentId, from, to))
    }

    override suspend fun reportIncident(input: IncidentInput): AppResult<Incident> {
        if (!auth.isDemoActive) return real.reportIncident(input)
        val incident = Incident(
            id = "demo-inc-${System.currentTimeMillis()}",
            studentId = input.studentId,
            studentName = DemoPeopleData.students.firstOrNull { it.id == input.studentId }?.name,
            occurredAt = input.occurredAt,
            type = input.type,
            severity = input.severity,
            description = input.description,
            actionTaken = input.actionTaken,
            status = "OPEN",
            reportedByName = DemoActors.forRole(auth.demoSession.value?.activeRole).name,
        )
        DemoHealthData.incidents.update { listOf(incident) + it }
        return AppResult.Success(incident)
    }

    override suspend fun closeIncident(id: String, note: String?): AppResult<Incident> {
        if (!auth.isDemoActive) return real.closeIncident(id, note)
        DemoHealthData.incidents.update { list -> list.map { if (it.id == id) it.copy(status = "CLOSED") else it } }
        return DemoHealthData.incidents.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) } ?: notFound()
    }

    private fun <T> notFound(): AppResult<T> = AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))

    internal companion object {
        fun demoIncidents(studentId: String?, from: String?, to: String?): List<Incident> = DemoHealthData.incidents.value
            .filter { (studentId == null || it.studentId == studentId) && DemoDates.inRange(DemoDates.dateOf(it.occurredAt).orEmpty(), from, to) }
            .sortedByDescending { it.occurredAt }
    }
}
