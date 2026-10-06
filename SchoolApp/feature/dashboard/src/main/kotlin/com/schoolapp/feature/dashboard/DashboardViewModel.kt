package com.schoolapp.feature.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.dashboard.DashboardRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.feature.dashboard.parent.ParentHome
import com.schoolapp.feature.dashboard.supervisor.SupervisorLoader
import com.schoolapp.feature.dashboard.teacher.TeacherDayLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Role-based home; reloads when the role or (for parents) the active child changes. */
@HiltViewModel
class DashboardViewModel @Inject constructor(
    authRepository: AuthRepository,
    private val dashboardRepository: DashboardRepository,
    private val supervisorLoader: SupervisorLoader,
    private val teacherDayLoader: TeacherDayLoader,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private var session: SessionContext? = null
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .distinctUntilChanged { old, new -> old.activeRole == new.activeRole && old.activeChild?.id == new.activeChild?.id }
                .collect { current ->
                    session = current
                    start(current, refreshing = false)
                }
        }
    }

    fun refresh() {
        session?.let { start(it, refreshing = true) }
    }

    private fun start(session: SessionContext, refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch { load(session, refreshing) }
    }

    private suspend fun load(session: SessionContext, refreshing: Boolean) {
        when (session.dashboardMode()) {
            DashboardMode.SUPERVISOR -> {
                showProgress(refreshing)
                _uiState.value = supervisorLoader.load(session, today(), session.showsTodayQueue())
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
            DashboardMode.WELCOME -> _uiState.value = session.toWelcome()
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
        _uiState.value = when (val result = dashboardRepository.childToday(child.id)) {
            is AppResult.Success -> DashboardUiState.Parent(child = child, home = ParentHome.from(result.data))
            is AppResult.Failure -> DashboardUiState.Parent(child = child, home = kept, error = result.error)
        }
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
