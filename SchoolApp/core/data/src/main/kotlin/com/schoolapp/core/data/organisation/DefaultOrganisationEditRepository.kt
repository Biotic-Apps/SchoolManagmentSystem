package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.model.organisation.BranchDetailsInput
import com.schoolapp.core.model.organisation.BranchScheduleInput
import com.schoolapp.core.model.organisation.BranchSettingsValues
import com.schoolapp.core.model.organisation.CalendarEventInput
import com.schoolapp.core.model.organisation.NamedOption
import com.schoolapp.core.model.organisation.SessionInput
import com.schoolapp.core.model.organisation.SessionTerm
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.OrganisationEditApi
import com.schoolapp.core.network.dto.organisation.SessionRequest
import com.schoolapp.core.network.dto.organisation.SetPrincipalRequest
import com.schoolapp.core.network.dto.organisation.TermRequest
import com.schoolapp.core.network.requireSuccess
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultOrganisationEditRepository @Inject constructor(
    private val api: OrganisationEditApi,
    private val apiCaller: ApiCaller,
) : OrganisationEditRepository {

    override suspend fun createBranch(details: BranchDetailsInput, schedule: BranchScheduleInput): AppResult<Unit> =
        apiCaller.call { api.createBranch(createBranchRequest(details, schedule)) }.map { }

    override suspend fun updateBranch(branchId: String, details: BranchDetailsInput?, schedule: BranchScheduleInput): AppResult<Unit> =
        apiCaller.call { api.updateBranch(branchId, branchPatch(details, schedule)) }.map { }

    override suspend fun setBranchActive(branchId: String, active: Boolean): AppResult<Unit> =
        apiCaller.call { api.branchStatus(branchId, if (active) "activate" else "archive").requireSuccess() }

    override suspend fun changePrincipal(branchId: String, userId: String): AppResult<Unit> =
        apiCaller.call { api.setPrincipal(branchId, SetPrincipalRequest(userId)).requireSuccess() }

    override suspend fun branchSettings(branchId: String): AppResult<BranchSettingsValues> =
        apiCaller.call { api.branchSettings(branchId).data.toSettingsValues() }

    override suspend fun saveBranchSettings(branchId: String, values: BranchSettingsValues): AppResult<Unit> =
        apiCaller.call { api.updateBranchSettings(branchId, values.toPatch()).requireSuccess() }

    override suspend fun principalOptions(): AppResult<List<NamedOption>> = apiCaller.call {
        api.users(PRINCIPAL).data.map { user ->
            val name = user.name ?: user.email ?: user.id
            NamedOption(user.id, if (user.name != null && user.email != null) "$name (${user.email})" else name)
        }.sortedBy { it.name.lowercase() }
    }

    override suspend fun schoolOptions(): AppResult<List<NamedOption>> = apiCaller.call {
        api.schools().data.mapNotNull { school -> school.id?.let { NamedOption(it, school.name ?: it) } }
    }

    override suspend fun saveSession(branchId: String, sessionId: String?, input: SessionInput): AppResult<Unit> = apiCaller.call {
        if (sessionId == null) {
            api.createSession(SessionRequest(branchId, input.name.trim(), input.startDate, input.endDate))
        } else {
            api.updateSession(sessionId, SessionRequest(name = input.name.trim(), startDate = input.startDate, endDate = input.endDate))
        }
    }.map { }

    override suspend fun transitionSession(sessionId: String, activate: Boolean): AppResult<Unit> =
        apiCaller.call { api.sessionTransition(sessionId, if (activate) "activate" else "close").requireSuccess() }

    override suspend fun terms(sessionId: String): AppResult<List<SessionTerm>> = apiCaller.call {
        api.terms(sessionId).data
            .map { SessionTerm(it.id, it.sessionId ?: sessionId, it.name, it.startDate, it.endDate) }
            .sortedBy { it.startDate }
    }

    override suspend fun saveTerm(sessionId: String, termId: String?, input: SessionInput): AppResult<Unit> = apiCaller.call {
        val body = TermRequest(input.name.trim(), input.startDate, input.endDate)
        if (termId == null) api.createTerm(sessionId, body) else api.updateTerm(termId, body)
    }.map { }

    override suspend fun deleteTerm(termId: String): AppResult<Unit> =
        apiCaller.call { api.deleteTerm(termId).requireSuccess() }

    override suspend fun saveEvent(eventId: String?, input: CalendarEventInput): AppResult<Unit> = apiCaller.call {
        if (eventId == null) api.createEvent(input.toCreateRequest()) else api.updateEvent(eventId, input.toPatch())
    }.map { }

    override suspend fun deleteEvent(eventId: String): AppResult<Unit> =
        apiCaller.call { api.deleteEvent(eventId).requireSuccess() }

    private companion object {
        const val PRINCIPAL = "PRINCIPAL"
    }
}
