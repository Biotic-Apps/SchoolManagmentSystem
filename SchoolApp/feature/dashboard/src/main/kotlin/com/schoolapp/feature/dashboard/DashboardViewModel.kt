package com.schoolapp.feature.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.data.fees.InvoicePdfDownloader
import com.schoolapp.core.model.SessionContext
import com.schoolapp.feature.dashboard.finance.FinanceLoader
import com.schoolapp.feature.dashboard.parent.ChallanState
import com.schoolapp.feature.dashboard.parent.ParentHome
import com.schoolapp.feature.dashboard.scope.DashboardScopeController
import com.schoolapp.feature.dashboard.scope.DashboardScopeState
import com.schoolapp.feature.dashboard.supervisor.SupervisorLoader
import com.schoolapp.feature.dashboard.teacher.TeacherDayLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Role-based home; reloads when the role or (for parents) the active child changes. */
@HiltViewModel
class DashboardViewModel @Inject constructor(
    authRepository: AuthRepository,
    private val dashboardRepository: DashboardRepository,
    private val supervisorLoader: SupervisorLoader,
    private val teacherDayLoader: TeacherDayLoader,
    private val financeLoader: FinanceLoader,
    private val clock: AppClock,
    private val challanPdf: InvoicePdfDownloader,
    private val scopeController: DashboardScopeController,
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _challan = MutableStateFlow(ChallanState())

    /** Parent fee tile download; kept apart from [uiState] so reloads do not reset it. */
    val challan: StateFlow<ChallanState> = _challan.asStateFlow()

    /** School › Branch › Session picker for supervisors (web DashboardScopeBar). */
    val scope: StateFlow<DashboardScopeState> = scopeController.state

    private var session: SessionContext? = null
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .distinctUntilChanged { old, new -> old.activeRole == new.activeRole && old.activeChild?.id == new.activeChild?.id }
                .collect { current ->
                    session = current
                    if (current.dashboardMode() == DashboardMode.SUPERVISOR) viewModelScope.launch { scopeController.reset(current) }
                    start(current, refreshing = false)
                }
        }
    }

    fun refresh() {
        session?.let { start(it, refreshing = true) }
    }

    /** Prepares the challan PDF of [invoiceId] (polling its job off the main thread) for the route to open. */
    fun downloadChallan(invoiceId: String) {
        if (_challan.value.isDownloading) return
        _challan.value = ChallanState(isDownloading = true)
        viewModelScope.launch {
            _challan.value = when (val result = challanPdf(invoiceId)) {
                is AppResult.Success -> ChallanState(urlToOpen = result.data)
                is AppResult.Failure -> ChallanState(error = result.error)
            }
        }
    }

    fun onScopeSchool(schoolId: String?) = changeScope { scopeController.selectSchool(it, schoolId) }

    fun onScopeBranch(branchId: String?) = changeScope { scopeController.selectBranch(it, branchId) }

    fun onScopeSession(sessionId: String?) = changeScope { scopeController.selectSession(sessionId) }

    fun onScopeReset() = changeScope { scopeController.reset(it) }

    private fun changeScope(change: suspend (SessionContext) -> Unit) {
        val current = session ?: return
        viewModelScope.launch {
            change(current)
            start(current, refreshing = true)
        }
    }

    fun onChallanOpened() = _challan.update { it.copy(urlToOpen = null) }

    private fun start(session: SessionContext, refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch { load(session, refreshing) }
    }

    private suspend fun load(session: SessionContext, refreshing: Boolean) {
        when (session.dashboardMode()) {
            DashboardMode.SUPERVISOR -> {
                showProgress(refreshing)
                _uiState.value = supervisorLoader.load(session, today(), session.showsTodayQueue(), scopeController.scope)
            }
            DashboardMode.TEACHER -> {
                showProgress(refreshing)
                _uiState.value = DashboardUiState.Teacher(
                    userName = session.user.fullName,
                    branchName = session.activeAssignments.firstOrNull()?.branchName,
                    day = teacherDayLoader.load(),
                )
            }
            DashboardMode.PARENT -> loadParent(session, refreshing)
            DashboardMode.WELCOME -> loadWelcome(session, refreshing)
        }
    }

    private suspend fun loadParent(session: SessionContext, refreshing: Boolean) {
        val child = session.activeChild
        if (child == null) {
            _uiState.value = DashboardUiState.Parent(child = null)
            return
        }
        val kept = (_uiState.value as? DashboardUiState.Parent)?.takeIf { it.child?.id == child.id }?.home
        _uiState.value = DashboardUiState.Parent(
            child = child,
            home = kept,
            isLoading = kept == null,
            isRefreshing = refreshing && kept != null,
        )
        _uiState.value = when (val result = dashboardRepository.parentHome(child.id)) {
            is AppResult.Success -> DashboardUiState.Parent(child = child, home = ParentHome.from(result.data, clock.now()))
            is AppResult.Failure -> DashboardUiState.Parent(child = child, home = kept, error = result.error)
        }
    }

    /** Welcome card at once; the finance card (accountant and other `fees.view` roles) follows when loaded. */
    private suspend fun loadWelcome(session: SessionContext, refreshing: Boolean) {
        val kept = (_uiState.value as? DashboardUiState.Welcome)?.finance
        val welcome = session.toWelcome()
        if (!financeLoader.shows(session)) {
            _uiState.value = welcome
            return
        }
        _uiState.value = welcome.copy(finance = kept, isRefreshing = refreshing)
        _uiState.value = welcome.copy(finance = financeLoader.load(session, today()))
    }

    private fun showProgress(refreshing: Boolean) {
        val current = _uiState.value
        _uiState.value = when {
            refreshing && current is DashboardUiState.Supervisor -> current.copy(isRefreshing = true)
            refreshing && current is DashboardUiState.Teacher -> current.copy(isRefreshing = true)
            else -> DashboardUiState.Loading
        }
    }

    private fun today(): String = clock.now().toLocalDate().toString()

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
}
