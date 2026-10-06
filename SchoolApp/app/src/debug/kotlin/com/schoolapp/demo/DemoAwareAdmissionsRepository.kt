package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.admissions.DefaultAdmissionsRepository
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.core.model.admissions.ApplicationStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareAdmissionsRepository @Inject constructor(
    private val real: DefaultAdmissionsRepository,
    private val auth: DemoAwareAuthRepository,
) : AdmissionsRepository {

    private val items = MutableStateFlow(DemoAdmissionsData.applications)

    override suspend fun applications(): AppResult<List<AdmissionApplication>> =
        if (auth.isDemoActive) AppResult.Success(items.value) else real.applications()

    override suspend fun application(id: String): AppResult<AdmissionApplication> {
        if (!auth.isDemoActive) return real.application(id)
        return items.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }

    override suspend fun decide(id: String, decision: AdmissionDecision, reason: String?): AppResult<Unit> {
        if (!auth.isDemoActive) return real.decide(id, decision, reason)
        val status = when (decision) {
            AdmissionDecision.OFFER -> ApplicationStatus.OFFERED
            AdmissionDecision.WAITLIST -> ApplicationStatus.WAITLISTED
            AdmissionDecision.REJECT -> ApplicationStatus.REJECTED
        }
        items.update { list ->
            val nextPosition = list.count { it.status == ApplicationStatus.WAITLISTED } + 1
            list.map {
                if (it.id != id) {
                    it
                } else {
                    it.copy(status = status, decisionReason = reason, waitlistPosition = nextPosition.takeIf { status == ApplicationStatus.WAITLISTED })
                }
            }
        }
        return AppResult.Success(Unit)
    }
}
