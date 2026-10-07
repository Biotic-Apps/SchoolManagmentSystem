package com.schoolapp.feature.dashboard.supervisor

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.feature.dashboard.DashboardUiState
import com.schoolapp.feature.dashboard.finance.FinanceLoader
import com.schoolapp.feature.dashboard.setup.SetupChecklistLoader
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

/** Loads the Today queue, the summary, the finance and setup cards in parallel; one failing still shows the others with an inline error. */
class SupervisorLoader @Inject constructor(
    private val repository: DashboardRepository,
    private val financeLoader: FinanceLoader,
    private val setupLoader: SetupChecklistLoader,
) {

    suspend fun load(session: SessionContext, date: String, showsToday: Boolean): DashboardUiState = coroutineScope {
        val scope = session.activeAssignments.firstOrNull()
        val pending = if (showsToday) async { repository.pending(session.activeBranchId, date) } else null
        val summary = async { repository.summary(scope?.branchId) }
        val finance = async { financeLoader.load(session, date) }
        val setup = async { setupLoader.load(session) }
        val pendingResult = pending?.await()
        val summaryResult = summary.await()
        val financeState = finance.await()
        val setupState = setup.await()
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
            finance = financeState,
            setup = setupState,
        )
    }
}
