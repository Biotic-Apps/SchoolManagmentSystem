package com.schoolapp.feature.dashboard.setup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.setup.SetupRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import javax.inject.Inject

/** Principal-only "Set up your school" card; a failed load hides it so the rest of the dashboard is unaffected. */
class SetupChecklistLoader @Inject constructor(private val repository: SetupRepository) {

    fun shows(session: SessionContext): Boolean = session.activeRole == RoleKey.PRINCIPAL

    suspend fun load(session: SessionContext): SetupCardState? {
        if (!shows(session)) return null
        return when (val result = repository.checklist(session.activeBranchId)) {
            is AppResult.Success -> result.data.toCard()
            is AppResult.Failure -> null
        }
    }
}
