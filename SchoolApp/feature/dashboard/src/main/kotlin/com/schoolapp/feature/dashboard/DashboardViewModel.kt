package com.schoolapp.feature.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val dashboardRepository: DashboardRepository,
    private val todayPeriodsLoader: TodayPeriodsLoader,
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    private fun load(refreshing: Boolean) {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            if (!session.showsSummary()) {
                val welcome = session.toWelcome()
                _uiState.value = welcome
                if (session.activeRole in TIMETABLE_ROLES) {
                    val periods = (todayPeriodsLoader.load() as? AppResult.Success)?.data.orEmpty()
                    _uiState.value = welcome.copy(todayPeriods = periods)
                }
                return@launch
            }
            val current = _uiState.value
            _uiState.value = if (refreshing && current is DashboardUiState.Summary) {
                current.copy(isRefreshing = true)
            } else {
                DashboardUiState.Loading
            }
            val scope = session.activeAssignments.firstOrNull()
            _uiState.value = when (val result = dashboardRepository.summary(scope?.branchId)) {
                is AppResult.Success -> DashboardUiState.Summary(
                    userName = session.user.fullName,
                    scopeName = scope?.branchName ?: scope?.schoolName,
                    metrics = result.data,
                )
                is AppResult.Failure -> DashboardUiState.Error(result.error)
            }
        }
    }

    private fun SessionContext.showsSummary(): Boolean =
        activeRole in SUMMARY_ROLES && has(DASHBOARD_VIEW)

    private fun SessionContext.toWelcome(): DashboardUiState.Welcome {
        val assignment = activeAssignments.firstOrNull()
        return DashboardUiState.Welcome(
            userName = user.fullName,
            role = activeRole,
            roleName = roleName(activeRole),
            branchName = assignment?.branchName,
            schoolName = assignment?.schoolName,
        )
    }

    private companion object {
        val SUMMARY_ROLES = setOf(RoleKey.SUPER_ADMIN, RoleKey.PRINCIPAL)
        val TIMETABLE_ROLES = setOf(RoleKey.TEACHER, RoleKey.HELPER)
        const val DASHBOARD_VIEW = "dashboard.view"
    }
}
