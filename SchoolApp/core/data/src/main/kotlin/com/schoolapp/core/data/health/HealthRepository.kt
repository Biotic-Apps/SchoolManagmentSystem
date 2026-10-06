package com.schoolapp.core.data.health

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.health.HealthAlert
import com.schoolapp.core.model.health.HealthChangeInput
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentInput

interface HealthRepository {
    suspend fun profile(studentId: String): AppResult<HealthProfile>

    /** Parent proposal; the office verifies it before it applies. */
    suspend fun requestChange(studentId: String, change: HealthChangeInput): AppResult<Unit>

    suspend fun alerts(sectionId: String): AppResult<List<HealthAlert>>
    suspend fun incidents(studentId: String? = null, branchId: String? = null, from: String? = null, to: String? = null): AppResult<List<Incident>>
    suspend fun reportIncident(input: IncidentInput): AppResult<Incident>
    suspend fun closeIncident(id: String, note: String?): AppResult<Incident>
}
