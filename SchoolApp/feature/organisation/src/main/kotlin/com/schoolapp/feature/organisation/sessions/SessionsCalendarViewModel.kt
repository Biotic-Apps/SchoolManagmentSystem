package com.schoolapp.feature.organisation.sessions

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
import com.schoolapp.feature.organisation.sessions.edit.SessionEditor
import com.schoolapp.feature.organisation.sessions.events.EventEditor
import com.schoolapp.feature.organisation.sessions.terms.TermsEditor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

/** Sessions (+ terms) and the month calendar of a branch, with the web's editing actions behind `sessions.add/edit`. */
@HiltViewModel
class SessionsCalendarViewModel @Inject constructor(
    private val optionsLoader: BranchOptionsLoader,
    private val repository: OrganisationRepository,
    private val savedStateHandle: SavedStateHandle,
    authRepository: AuthRepository,
    val sessionEditor: SessionEditor,
    val terms: TermsEditor,
    val events: EventEditor,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SessionsCalendarUiState())
    val uiState: StateFlow<SessionsCalendarUiState> = _uiState.asStateFlow()

    private var branchJob: Job? = null
    private var ownSchoolId: String? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            ownSchoolId = session.activeAssignments.firstNotNullOfOrNull { it.schoolId }
            _uiState.update { it.copy(canAddSession = session.has(SESSIONS_ADD), canEdit = session.has(SESSIONS_EDIT)) }
        }
        sessionEditor.attach(viewModelScope, { _uiState.value.selectedBranchId }, ::refresh)
        terms.attach(viewModelScope, ::refresh)
        events.attach(viewModelScope, { (_uiState.value.schoolId ?: ownSchoolId) to _uiState.value.selectedBranchId }, ::refresh)
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        loadOptions(refreshing = false)
    }

    /** Reloads the selected branch while sessions and events stay visible; a failure keeps them. */
    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        val branchId = _uiState.value.selectedBranchId
        if (branchId == null) loadOptions(refreshing = true) else fetchBranch(branchId, refreshing = true)
    }

    fun onBranchSelected(branchId: String) = fetchBranch(branchId, refreshing = false)

    /** Moves the calendar by [delta] months and reloads only its entries. */
    fun shiftMonth(delta: Long) {
        _uiState.update { it.copy(month = it.month.plusMonths(delta), eventsLoading = true) }
        val branchId = _uiState.value.selectedBranchId ?: return
        branchJob?.cancel()
        branchJob = viewModelScope.launch {
            val month = _uiState.value.month
            val result = repository.calendar(branchId, month.atDay(1).toString(), month.atEndOfMonth().toString())
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(eventsLoading = false, error = null, events = result.data)
                    is AppResult.Failure -> it.copy(eventsLoading = false, error = result.error)
                }
            }
        }
    }

    private fun loadOptions(refreshing: Boolean) {
        viewModelScope.launch {
            when (val result = optionsLoader.load()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
                is AppResult.Success -> {
                    val options = result.data
                    val selected = savedStateHandle.get<String>(KEY_BRANCH)?.takeIf { id -> options.branches.any { it.id == id } }
                        ?: options.preferredId?.takeIf { id -> options.branches.any { it.id == id } }
                        ?: options.branches.firstOrNull()?.id
                    _uiState.update { it.copy(branches = options.branches) }
                    if (selected == null) {
                        _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = null) }
                    } else {
                        fetchBranch(selected, refreshing)
                    }
                }
            }
        }
    }

    private fun fetchBranch(branchId: String, refreshing: Boolean) {
        savedStateHandle[KEY_BRANCH] = branchId
        _uiState.update {
            if (refreshing) {
                it.copy(selectedBranchId = branchId, isRefreshing = true)
            } else {
                it.copy(selectedBranchId = branchId, isLoading = true, error = null, sessions = emptyList(), events = emptyList())
            }
        }
        branchJob?.cancel()
        branchJob = viewModelScope.launch {
            val month: YearMonth = _uiState.value.month
            val eventsCall = async { repository.calendar(branchId, month.atDay(1).toString(), month.atEndOfMonth().toString()) }
            val sessions = repository.sessions(branchId)
            val events = eventsCall.await()
            val failure = (sessions as? AppResult.Failure)?.error ?: (events as? AppResult.Failure)?.error
            _uiState.update {
                it.copy(
                    isLoading = false,
                    isRefreshing = false,
                    eventsLoading = false,
                    error = failure,
                    sessions = (sessions as? AppResult.Success)?.data ?: it.sessions,
                    events = (events as? AppResult.Success)?.data ?: it.events,
                )
            }
        }
    }

    private companion object {
        const val KEY_BRANCH = "branch"
        const val SESSIONS_ADD = "sessions.add"
        const val SESSIONS_EDIT = "sessions.edit"
    }
}
