package com.schoolapp.feature.health

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.core.model.health.HealthChangeInput
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentInput
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary

internal class FakeHealthRepository : HealthRepository {
    val profileCalls = mutableListOf<String>()
    val incidentCalls = mutableListOf<String?>()
    val reported = mutableListOf<IncidentInput>()
    val changeRequests = mutableListOf<Pair<String, HealthChangeInput>>()
    var profiles: Map<String, HealthProfile> = emptyMap()

    override suspend fun profile(studentId: String): AppResult<HealthProfile> {
        profileCalls += studentId
        return profiles[studentId]?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }

    override suspend fun requestChange(studentId: String, change: HealthChangeInput): AppResult<Unit> {
        changeRequests += studentId to change
        return AppResult.Success(Unit)
    }

    override suspend fun alerts(sectionId: String): AppResult<List<HealthAlert>> = AppResult.Success(emptyList())

    override suspend fun incidents(studentId: String?, branchId: String?, from: String?, to: String?): AppResult<List<Incident>> {
        incidentCalls += studentId
        return AppResult.Success(emptyList())
    }

    override suspend fun reportIncident(input: IncidentInput): AppResult<Incident> {
        reported += input
        return AppResult.Success(
            Incident("i1", input.studentId, "Ali", input.occurredAt, input.type, input.severity, input.description, input.actionTaken, "REPORTED", "Sara"),
        )
    }

    override suspend fun closeIncident(id: String, note: String?): AppResult<Incident> = AppResult.Failure(AppError.Network)
}

internal class FakeStudentsRepository : StudentsRepository {
    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> =
        AppResult.Success(listOf(summary("s9", "Bilal Ahmed")))

    override suspend fun student(id: String): AppResult<StudentDetail> =
        AppResult.Success(StudentDetail(summary(id, "Student $id"), null, null, null, null, null, emptyList(), emptyList()))

    private fun summary(id: String, name: String) =
        StudentSummary(id, null, name, null, null, null, "Class 5", "A", "sec1", null, "ACTIVE", null, null)
}
