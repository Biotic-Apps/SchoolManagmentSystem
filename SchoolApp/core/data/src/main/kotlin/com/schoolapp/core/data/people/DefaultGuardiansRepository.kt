package com.schoolapp.core.data.people

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.people.ChildLinkChallenge
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.ContactChange
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.model.people.GuardianRelation
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.GuardiansApi
import com.schoolapp.core.network.dto.people.ChildLinkStartBodyDto
import com.schoolapp.core.network.dto.people.ContactChangeBodyDto
import com.schoolapp.core.network.dto.people.OtpBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultGuardiansRepository @Inject constructor(
    private val api: GuardiansApi,
    private val apiCaller: ApiCaller,
) : GuardiansRepository {

    override suspend fun guardians(search: String?): AppResult<List<Guardian>> =
        apiCaller.call { api.guardians(search = search.clean()).data.map { it.toModel() } }

    override suspend fun pendingChildLinks(): AppResult<List<ChildLinkRequest>> =
        apiCaller.call { api.childLinks().data.map { it.toModel() } }

    override suspend fun startChildLink(
        admissionNo: String,
        dob: String,
        relation: GuardianRelation,
    ): AppResult<ChildLinkChallenge> = apiCaller.call {
        api.requestChildLink(ChildLinkStartBodyDto(admissionNo.trim(), dob, relation.name)).data.toModel()
    }

    override suspend fun confirmChildLink(requestId: String, code: String): AppResult<Unit> =
        apiCaller.call { api.verifyChildLinkOtp(requestId, OtpBodyDto(code.trim())) }

    override suspend fun requestContactChange(change: ContactChange): AppResult<Unit> = apiCaller.call {
        api.requestContactChange(ContactChangeBodyDto(change.phone.clean(), change.email.clean(), change.address.clean()))
    }

    private fun String?.clean(): String? = this?.trim()?.takeIf { it.isNotEmpty() }
}
