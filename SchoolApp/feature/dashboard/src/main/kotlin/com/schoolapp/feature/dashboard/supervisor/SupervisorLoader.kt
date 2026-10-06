package com.schoolapp.feature.dashboard.supervisor

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.feature.dashboard.DashboardUiState
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

/** Loads the Today queue and the summary in parallel; one failing still shows the other with an inline error. */
class SupervisorLoader @Inject constructor(private val repository: DashboardRepository) {

    suspend fun load(session: SessionContext, date: String, showsToday: Boolean): DashboardUiState = coroutineScope {
        val scope = session.activeAssignments.firstOrNull()
        val pending = if (showsToday) async { repository.pending(session.activeBranchId, date) } else null
        val summary = async { repository.summary(scope?.branchId) }
        val pendingResult = pending?.await()
        val summaryResult = summary.await()
        if (summaryResult is AppResult.Failure && (pendingResult == null || pendingResult is AppResult.Failure)) {
            return@coroutineScope DashboardUiState.Error(summaryResult.error)
        }
        DashboardUiState.Supervisor(
            userName = session.user.fullName,
            scopeName = scope?.branchName ?: scope?.schoolName,
            date = date,
            showsToday = showsToday,
            tiles = (pendingResult as? AppResult.Success)?.data?.let(::pendingTiles).orEmpty(),
            pendingError = (pendingResult as? AppResult.Failure)?.error,
            metrics = (summaryResult as? AppResult.Success)?.data.orEmpty(),
            summaryError = (summaryResult as? AppResult.Failure)?.error,
        )
    }
}
