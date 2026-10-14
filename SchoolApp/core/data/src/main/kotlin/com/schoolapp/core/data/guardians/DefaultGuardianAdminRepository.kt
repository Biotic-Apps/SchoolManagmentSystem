package com.schoolapp.core.data.guardians

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.exams.admin.JobFileWaiter
import com.schoolapp.core.data.people.toModel
import com.schoolapp.core.data.students.list.toPage
import com.schoolapp.core.model.guardians.LoginSlipTarget
import com.schoolapp.core.model.guardians.ParentCredentials
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.guardians.GuardianAdminApi
import com.schoolapp.core.network.guardians.LoginSlipBodyDto
import com.schoolapp.core.network.guardians.ReasonBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
internal class DefaultGuardianAdminRepository @Inject constructor(
    private val api: GuardianAdminApi,
    private val apiCaller: ApiCaller,
    private val jobs: JobFileWaiter,
) : GuardianAdminRepository {

    override suspend fun guardians(search: String?, page: Int) = apiCaller.call {
        api.guardians(page, search?.trim()?.takeIf { it.isNotEmpty() }).toPage(page, GuardianAdminApi.PAGE_SIZE) { it.toModel() }
    }

    override suspend fun linkRequests(page: Int) = apiCaller.call {
        api.childLinks(page).toPage(page, GuardianAdminApi.PAGE_SIZE) { it.toModel() }
    }

    override suspend fun approveLink(requestId: String) =
        apiCaller.call { api.approveChildLink(requestId, ReasonBodyDto()) }.map { }

    override suspend fun rejectLink(requestId: String, reason: String?) =
        apiCaller.call { api.rejectChildLink(requestId, ReasonBodyDto(reason?.trim()?.takeIf { it.isNotEmpty() })) }.map { }

    override suspend fun detail(guardianId: String) = apiCaller.call { api.guardian(guardianId).data.toModel() }

    override suspend fun createAccount(guardianId: String) = apiCaller.call {
        val dto = api.createAccount(guardianId).data
        ParentCredentials(dto.email, dto.phone, dto.temporaryPassword)
    }

    override suspend fun resetPassword(guardianId: String) = apiCaller.call {
        ParentCredentials(null, null, api.resetPassword(guardianId).data.temporaryPassword)
    }

    override suspend fun sendSignIn(guardianId: String) = apiCaller.call { api.sendSignIn(guardianId).data.channels }

    override suspend fun unlink(studentId: String, linkId: String, reason: String) =
        apiCaller.call { api.unlink(studentId, linkId, ReasonBodyDto(reason.trim())) }.map { }

    override suspend fun previewLoginSlips(target: LoginSlipTarget) =
        apiCaller.call { api.previewLoginSlips(target.toBody()).data.toModel() }

    override suspend fun printLoginSlips(target: LoginSlipTarget): AppResult<String> {
        val jobId = when (val queued = apiCaller.call { api.printLoginSlips(target.toBody()).data.jobId }) {
            is AppResult.Failure -> return queued
            is AppResult.Success -> queued.data ?: return AppResult.Failure(AppError.Server(HTTP_SERVER_ERROR, JobFileWaiter.CODE_FAILED, null))
        }
        return jobs.awaitFile(jobId)
    }

    private fun LoginSlipTarget.toBody() =
        if (sectionId != null) LoginSlipBodyDto(sectionId = sectionId) else LoginSlipBodyDto(branchId = branchId, classId = classId)

    private companion object {
        const val HTTP_SERVER_ERROR = 500
    }
}
