package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject

/** Read-only organisation data for mobile; editing is web-only. */
interface OrganisationRepository {
    suspend fun branches(): AppResult<List<Branch>>
    suspend fun branchOverview(branchId: String): AppResult<BranchOverview>
    suspend fun sessions(branchId: String): AppResult<List<AcademicSession>>
    suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>>
    suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>>
    suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>>
    suspend fun subjects(schoolId: String?): AppResult<List<Subject>>
}
