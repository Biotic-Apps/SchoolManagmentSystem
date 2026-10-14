package com.schoolapp.feature.homework.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.homework.HomeworkRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.homework.HomeworkChange
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

/** Staff homework: pick branch (super admin) and section, list its homework; refreshes after any mutation. */
@HiltViewModel
class StaffHomeworkViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val organisationRepository: OrganisationRepository,
    private val homeworkRepository: HomeworkRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StaffHomeworkUiState())
    val uiState: StateFlow<StaffHomeworkUiState> = _uiState.asStateFlow()

    private var listJob: Job? = null

    init {
        loadScope()
        viewModelScope.launch {
            homeworkRepository.changes.collect { change ->
                if (change == HomeworkChange.ASSIGNED) _uiState.update { it.copy(change = change) }
                loadList(silent = true)
            }
        }
    }

    fun retry() = loadScope()

    fun onBranchSelected(branchId: String) {
        if (branchId == _uiState.value.branchId) return
        _uiState.update { it.copy(branchId = branchId, isLoading = true, scopeError = null) }
        viewModelScope.launch { loadSections(branchId) }
    }

    fun onSectionSelected(sectionId: String) {
        if (sectionId == _uiState.value.sectionId) return
        _uiState.update { it.copy(sectionId = sectionId, homework = emptyList()) }
        loadList(silent = false)
    }

    fun refresh() {
        if (_uiState.value.sectionId == null) return loadScope()
        _uiState.update { it.copy(isRefreshing = true) }
        loadList(silent = true)
    }

    fun onChangeShown() = _uiState.update { it.copy(change = null) }

    private fun loadScope() {
        _uiState.update { it.copy(isLoading = true, scopeError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canAssign = session.has(ADD_PERMISSION)) }
            val fixed = session.activeBranchId
            if (fixed != null) return@launch loadSections(fixed)
            when (val result = organisationRepository.branches()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, scopeError = result.error) }
                is AppResult.Success -> {
                    val branches = result.data
                    val branchId = _uiState.value.branchId?.takeIf { id -> branches.any { it.id == id } } ?: branches.firstOrNull()?.id
                    _uiState.update { it.copy(branches = branches.takeIf { list -> list.size > 1 }.orEmpty(), branchId = branchId) }
                    if (branchId == null) _uiState.update { it.copy(isLoading = false, sections = emptyList()) } else loadSections(branchId)
                }
            }
        }
    }

    private suspend fun loadSections(branchId: String) {
        val activeSession = (organisationRepository.sessions(branchId) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
        when (val result = organisationRepository.sections(branchId, activeSession?.id)) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, scopeError = result.error) }
            is AppResult.Success -> {
                val sections = result.data
                val current = _uiState.value.sectionId?.takeIf { id -> sections.any { it.id == id } }
                _uiState.update {
                    it.copy(isLoading = false, branchId = branchId, sections = sections, sectionId = current ?: sections.firstOrNull()?.id)
                }
                loadList(silent = false)
            }
        }
    }

    private fun loadList(silent: Boolean) {
        val sectionId = _uiState.value.sectionId ?: return _uiState.update { it.copy(isRefreshing = false, homework = emptyList()) }
        listJob?.cancel()
        if (!silent) _uiState.update { it.copy(isListLoading = true, listError = null) }
        listJob = viewModelScope.launch {
            val result = homeworkRepository.list(sectionId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isListLoading = false, isRefreshing = false, listError = null, homework = result.data)
                    is AppResult.Failure -> state.copy(isListLoading = false, isRefreshing = false, listError = result.error)
                }
            }
        }
    }

    private companion object {
        const val ADD_PERMISSION = "homework.add"
    }
}
