package com.schoolapp.core.data.admissions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AdmissionsApi
import com.schoolapp.core.network.dto.admissions.DecideBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultAdmissionsRepository @Inject constructor(
    private val api: AdmissionsApi,
    private val apiCaller: ApiCaller,
) : AdmissionsRepository {

    override suspend fun applications(): AppResult<List<AdmissionApplication>> =
        apiCaller.call { api.applications().data.map { it.toModel() }.sortedByDescending { it.createdAt } }

    override suspend fun application(id: String): AppResult<AdmissionApplication> =
        apiCaller.call { api.application(id).data.toModel() }

    override suspend fun decide(id: String, decision: AdmissionDecision, reason: String?): AppResult<Unit> =
        apiCaller.call { api.decide(id, DecideBodyDto(decision.name, reason?.trim()?.takeIf { it.isNotEmpty() })) }
}
