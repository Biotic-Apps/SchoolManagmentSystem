package com.schoolapp.core.data.admissions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionDecision

/** Light admissions on mobile: browse applications and decide; full forms stay on the web panel. */
interface AdmissionsRepository {
    suspend fun applications(): AppResult<List<AdmissionApplication>>
    suspend fun application(id: String): AppResult<AdmissionApplication>
    suspend fun decide(id: String, decision: AdmissionDecision, reason: String?): AppResult<Unit>
}
