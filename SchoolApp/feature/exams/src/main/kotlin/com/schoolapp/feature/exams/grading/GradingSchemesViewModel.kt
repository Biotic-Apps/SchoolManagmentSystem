package com.schoolapp.feature.exams.grading

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.grading.GradingSchemesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.exams.grading.GradingScheme
import com.schoolapp.core.model.exams.grading.GradingSchemeInput
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.feature.exams.grading.GradingRules.whole
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

enum class GradingMessage { CREATED, UPDATED, APPROVED }

@Immutable
data class GradingUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val sessions: List<AcademicSession> = emptyList(),
    val sessionId: String? = null,
    val schemes: List<GradingScheme> = emptyList(),
    val canAdd: Boolean = false,
    val canEdit: Boolean = false,
    val canApprove: Boolean = false,
    val form: GradingForm? = null,
    val confirmApproveId: String? = null,
    val approvingId: String? = null,
    val actionError: AppError? = null,
    val message: GradingMessage? = null,
)

/** Grading schemes of a session: create / edit bands, approve (web GradingTab). */
@HiltViewModel
class GradingSchemesViewModel @Inject constructor(
    private val repository: GradingSchemesRepository,
    private val organisation: OrganisationRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(GradingUiState())
    val state: StateFlow<GradingUiState> = _state.asStateFlow()

    internal val form = GradingFormActions(_state)

    private var schoolId: String? = null
    private var loadJob: Job? = null

    init {
        start()
    }

    fun retry() = if (_state.value.sessions.isEmpty()) start() else load(refreshing = false)

    fun refresh() = load(refreshing = true)

    fun onSession(id: String) {
        if (id == _state.value.sessionId) return
        _state.update { it.copy(sessionId = id, schemes = emptyList(), message = null) }
        load(refreshing = false)
    }

    fun requestApprove(id: String) = _state.update { it.copy(confirmApproveId = id) }

    fun dismissApprove() = _state.update { it.copy(confirmApproveId = null) }

    fun approve() {
        val id = _state.value.confirmApproveId ?: return
        _state.update { it.copy(confirmApproveId = null, approvingId = id, actionError = null, message = null) }
        viewModelScope.launch {
            when (val result = repository.approve(id)) {
                is AppResult.Success -> _state.update { it.copy(approvingId = null, schemes = it.schemes.replace(result.data), message = GradingMessage.APPROVED) }
                is AppResult.Failure -> _state.update { it.copy(approvingId = null, actionError = result.error) }
            }
        }
    }

    fun save() {
        val state = _state.value
        val current = state.form ?: return
        val sessionId = state.sessionId ?: return
        if (current.isSaving) return
        val (bandIssues, coverage) = GradingRules.check(current.bands)
        val pass = current.passPercent.whole()
        val checked = current.copy(nameMissing = current.name.isBlank(), passInvalid = pass == null, bandIssues = bandIssues, coverage = coverage)
        val school = schoolId
        if (checked.nameMissing || checked.passInvalid || bandIssues.isNotEmpty() || coverage.isNotEmpty() || school == null) {
            return _state.update { it.copy(form = checked) }
        }
        val input = GradingSchemeInput(school, sessionId, current.name, requireNotNull(pass).toDouble(), GradingRules.toBands(current.bands))
        _state.update { it.copy(form = checked.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            val result = current.schemeId?.let { repository.update(it, input) } ?: repository.create(input)
            _state.update {
                when (result) {
                    is AppResult.Failure -> it.copy(form = it.form?.copy(isSaving = false, error = result.error))
                    is AppResult.Success -> {
                        val list = if (current.schemeId == null) it.schemes + result.data else it.schemes.replace(result.data)
                        val message = if (current.schemeId == null) GradingMessage.CREATED else GradingMessage.UPDATED
                        it.copy(form = null, schemes = list.sortedBy { s -> s.name.lowercase() }, message = message)
                    }
                }
            }
        }
    }

    private fun start() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            schoolId = session.activeAssignments.firstNotNullOfOrNull { it.schoolId } ?: session.assignments.firstNotNullOfOrNull { it.schoolId }
            _state.update { it.copy(canAdd = session.has("exams.add"), canEdit = session.has("exams.edit"), canApprove = session.has("exams.approve")) }
            val branchId = session.activeBranchId ?: return@launch _state.update { it.copy(isLoading = false) }
            if (schoolId == null) {
                schoolId = (organisation.branches() as? AppResult.Success)?.data?.firstOrNull { it.id == branchId }?.schoolId
            }
            when (val result = organisation.sessions(branchId)) {
                is AppResult.Failure -> _state.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val sessions = result.data
                    val selected = (sessions.firstOrNull { it.isActive } ?: sessions.firstOrNull())?.id
                    _state.update { it.copy(sessions = sessions, sessionId = selected) }
                    if (selected == null) _state.update { it.copy(isLoading = false) } else load(refreshing = false)
                }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        val sessionId = _state.value.sessionId ?: return
        loadJob?.cancel()
        _state.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.schemes(sessionId)
            _state.update {
                if (it.sessionId != sessionId) return@update it
                when (result) {
                    is AppResult.Success -> it.copy(isLoading = false, isRefreshing = false, schemes = result.data)
                    is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private fun List<GradingScheme>.replace(updated: GradingScheme) = map { if (it.id == updated.id) updated else it }
}
