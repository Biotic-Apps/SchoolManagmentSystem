package com.schoolapp.core.data.organisation

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.organisation.ClassOverview

/** Read-only Classes overview: one card per class of the branch's session. */
interface ClassesOverviewRepository {
    /** [schoolId] is only used when the server is older than `/classes/overview` (fallback from lists). */
    suspend fun overview(branchId: String, schoolId: String?, sessionId: String?): AppResult<List<ClassOverview>>
}
