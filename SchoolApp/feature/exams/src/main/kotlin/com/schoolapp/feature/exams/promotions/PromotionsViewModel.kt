package com.schoolapp.feature.exams.promotions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.data.exams.promotions.PromotionsRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.exams.promotions.PromotionDecision
import com.schoolapp.core.model.organisation.AcademicSession
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** End-of-session promotions for the branch (web PromotionsTab): review, suggest, override, confirm, apply. */
@HiltViewModel
class PromotionsViewModel @Inject constructor(
    private val repository: PromotionsRepository,
    private val organisation: OrganisationRepository,
    exams: ExamsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(PromotionsState())
    val state: StateFlow<PromotionsState> = _state.asStateFlow()

    internal val actions = PromotionActions(viewModelScope, _state, repository, organisation, exams) { load(refreshing = false, quiet = true) }

    private var loadJob: Job? = null

    init {
        start()
    }

    fun retry() = if (_state.value.sessions.isEmpty()) start() else load(refreshing = false)

    fun refresh() = load(refreshing = true)

    fun onFromSession(id: String) {
        if (id == _state.value.fromSessionId) return
        _state.update { it.copy(fromSessionId = id, toSessionId = nextSession(it.sessions, id), rows = emptyList(), classFilter = null, message = null) }
        load(refreshing = false)
    }

    fun onClassFilter(id: String?) = _state.update { it.copy(classFilter = id) }

    fun onDecisionFilter(decision: PromotionDecision?) = _state.update { it.copy(decisionFilter = decision) }

    private fun start() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val manager = session.activeRole == RoleKey.PRINCIPAL || session.activeRole == RoleKey.SUPER_ADMIN
            val branchId = session.activeBranchId
            _state.update { it.copy(branchId = branchId, canSuggest = session.has("exams.approve"), isManager = manager && session.has("exams.approve")) }
            if (branchId == null) return@launch _state.update { it.copy(isLoading = false) }
            when (val result = organisation.sessions(branchId)) {
                is AppResult.Failure -> _state.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val sessions = result.data
                    val from = (sessions.firstOrNull { it.isActive } ?: sessions.firstOrNull())?.id
                    _state.update { it.copy(sessions = sessions, fromSessionId = from, toSessionId = from?.let { id -> nextSession(sessions, id) }) }
                    if (from == null) _state.update { it.copy(isLoading = false) } else load(refreshing = false)
                }
            }
        }
    }

    private fun load(refreshing: Boolean, quiet: Boolean = false) {
        val state = _state.value
        val branchId = state.branchId ?: return
        val from = state.fromSessionId ?: return
        loadJob?.cancel()
        _state.update { it.copy(isLoading = !refreshing && !quiet, isRefreshing = refreshing, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.promotions(branchId, from)
            _state.update {
                if (it.fromSessionId != from) return@update it
                when (result) {
                    is AppResult.Success -> it.copy(isLoading = false, isRefreshing = false, rows = result.data)
                    is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        /** The session that starts after [fromId], as the default promotion target. */
        fun nextSession(sessions: List<AcademicSession>, fromId: String): String? {
            val from = sessions.firstOrNull { it.id == fromId }?.startDate ?: return null
            return sessions.filter { (it.startDate ?: "") > from }.minByOrNull { it.startDate.orEmpty() }?.id
        }
    }
}
