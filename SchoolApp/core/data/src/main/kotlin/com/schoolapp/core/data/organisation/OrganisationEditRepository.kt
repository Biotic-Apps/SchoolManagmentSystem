package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.organisation.BranchDetailsInput
import com.schoolapp.core.model.organisation.BranchScheduleInput
import com.schoolapp.core.model.organisation.BranchSettingsValues
import com.schoolapp.core.model.organisation.CalendarEventInput
import com.schoolapp.core.model.organisation.NamedOption
import com.schoolapp.core.model.organisation.SessionInput
import com.schoolapp.core.model.organisation.SessionTerm

/** Branch, academic session, term and calendar editing (same endpoints and rules as the web panel). */
interface OrganisationEditRepository {
    suspend fun createBranch(details: BranchDetailsInput, schedule: BranchScheduleInput): AppResult<Unit>

    /** [details] null = timings and working days only (what a principal may change). */
    suspend fun updateBranch(branchId: String, details: BranchDetailsInput?, schedule: BranchScheduleInput): AppResult<Unit>
    suspend fun setBranchActive(branchId: String, active: Boolean): AppResult<Unit>
    suspend fun changePrincipal(branchId: String, userId: String): AppResult<Unit>
    suspend fun branchSettings(branchId: String): AppResult<BranchSettingsValues>
    suspend fun saveBranchSettings(branchId: String, values: BranchSettingsValues): AppResult<Unit>
    suspend fun principalOptions(): AppResult<List<NamedOption>>
    suspend fun schoolOptions(): AppResult<List<NamedOption>>

    /** [sessionId] null creates a draft session in [branchId]. */
    suspend fun saveSession(branchId: String, sessionId: String?, input: SessionInput): AppResult<Unit>

    /** Draft → active, or active → closed (closing can't be undone). */
    suspend fun transitionSession(sessionId: String, activate: Boolean): AppResult<Unit>
    suspend fun terms(sessionId: String): AppResult<List<SessionTerm>>
    suspend fun saveTerm(sessionId: String, termId: String?, input: SessionInput): AppResult<Unit>
    suspend fun deleteTerm(termId: String): AppResult<Unit>

    /** [eventId] null creates the entry; on edit the school/branch scope is kept. */
    suspend fun saveEvent(eventId: String?, input: CalendarEventInput): AppResult<Unit>
    suspend fun deleteEvent(eventId: String): AppResult<Unit>
}
