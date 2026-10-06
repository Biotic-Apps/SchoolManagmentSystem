package com.schoolapp.core.data.health

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.core.model.health.HealthChangeInput
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentInput
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.HealthApi
import com.schoolapp.core.network.dto.common.NoteBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultHealthRepository @Inject constructor(
    private val api: HealthApi,
    private val apiCaller: ApiCaller,
) : HealthRepository {

    override suspend fun profile(studentId: String): AppResult<HealthProfile> =
        apiCaller.call { api.profile(studentId).data.toModel() }

    override suspend fun requestChange(studentId: String, change: HealthChangeInput): AppResult<Unit> =
        apiCaller.call { api.requestChange(studentId, change.toBody()) }

    override suspend fun alerts(sectionId: String): AppResult<List<HealthAlert>> =
        apiCaller.call { api.alerts(sectionId).data.mapNotNull { it.toModel() } }

    override suspend fun incidents(studentId: String?, branchId: String?, from: String?, to: String?): AppResult<List<Incident>> =
        apiCaller.call { api.incidents(studentId, branchId, from, to).data.map { it.toModel() }.sortedByDescending { it.occurredAt } }

    override suspend fun reportIncident(input: IncidentInput): AppResult<Incident> =
        apiCaller.call { api.reportIncident(input.toBody()).data.toModel() }

    override suspend fun closeIncident(id: String, note: String?): AppResult<Incident> =
        apiCaller.call { api.closeIncident(id, NoteBodyDto(note.clean())).data.toModel() }
}
