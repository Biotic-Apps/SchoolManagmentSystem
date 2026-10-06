package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.DefaultGuardiansRepository
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.model.people.ChildLinkChallenge
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.ContactChange
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.model.people.GuardianRelation
import javax.inject.Inject
import javax.inject.Singleton

/** Demo link flow: any admission number works; the code is shown on screen as the dev code. */
@Singleton
class DemoAwareGuardiansRepository @Inject constructor(
    private val real: DefaultGuardiansRepository,
    private val auth: DemoAwareAuthRepository,
) : GuardiansRepository {

    private val demo: Boolean get() = auth.isDemoActive

    override suspend fun guardians(search: String?): AppResult<List<Guardian>> {
        if (!demo) return real.guardians(search)
        val q = search?.trim().orEmpty()
        return AppResult.Success(DemoPeopleData.guardians.filter { q.isEmpty() || it.name.contains(q, true) || it.phone.orEmpty().contains(q) })
    }

    override suspend fun pendingChildLinks(): AppResult<List<ChildLinkRequest>> =
        if (demo) AppResult.Success(DemoPeopleData.childLinkRequests) else real.pendingChildLinks()

    override suspend fun startChildLink(admissionNo: String, dob: String, relation: GuardianRelation): AppResult<ChildLinkChallenge> =
        if (demo) AppResult.Success(ChildLinkChallenge("demo-link-req", "0300*****00", DEMO_CODE)) else real.startChildLink(admissionNo, dob, relation)

    override suspend fun confirmChildLink(requestId: String, code: String): AppResult<Unit> = when {
        !demo -> real.confirmChildLink(requestId, code)
        code == DEMO_CODE -> AppResult.Success(Unit)
        else -> AppResult.Failure(AppError.Validation("The code is incorrect or has expired."))
    }

    override suspend fun requestContactChange(change: ContactChange): AppResult<Unit> =
        if (demo) AppResult.Success(Unit) else real.requestContactChange(change)

    private companion object {
        const val DEMO_CODE = "123456"
    }
}
