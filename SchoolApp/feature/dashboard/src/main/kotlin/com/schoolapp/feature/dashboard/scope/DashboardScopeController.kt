package com.schoolapp.feature.dashboard.scope

import com.schoolapp.core.model.SessionContext
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject

/** Holds the dashboard scope picker; changing a level clears the levels below it, like the web ScopePicker. */
class DashboardScopeController @Inject constructor(private val loader: ScopeOptionsLoader) {

    private val _state = MutableStateFlow(DashboardScopeState())
    val state: StateFlow<DashboardScopeState> = _state.asStateFlow()

    val scope: DashboardScope get() = _state.value.scope

    /** Fresh picker for a (new) role: everything in scope, options reloaded. */
    suspend fun reset(session: SessionContext) = coroutineScope {
        _state.value = DashboardScopeState()
        val schools = async { loader.schools(session) }
        val branches = async { loader.branches(session, null) }
        _state.value = DashboardScopeState(schools = schools.await(), branches = branches.await())
    }

    suspend fun selectSchool(session: SessionContext, schoolId: String?) {
        _state.update { it.copy(scope = DashboardScope(schoolId = schoolId), sessions = emptyList()) }
        val branches = loader.branches(session, schoolId)
        _state.update { it.copy(branches = branches) }
    }

    suspend fun selectBranch(session: SessionContext, branchId: String?) {
        _state.update { it.copy(scope = it.scope.copy(branchId = branchId, sessionId = null), sessions = emptyList()) }
        val sessions = loader.sessions(session, branchId)
        _state.update { it.copy(sessions = sessions) }
    }

    fun selectSession(sessionId: String?) = _state.update { it.copy(scope = it.scope.copy(sessionId = sessionId)) }
}
