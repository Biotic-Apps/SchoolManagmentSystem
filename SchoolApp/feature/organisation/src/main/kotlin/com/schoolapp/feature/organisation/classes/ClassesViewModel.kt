package com.schoolapp.feature.organisation.classes

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.data.academics.ClassStructureRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
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

/** Classes overview with Add class and Reorder (same endpoints and permissions as the web Classes page). */
@HiltViewModel
class ClassesViewModel @Inject constructor(
    private val optionsLoader: BranchOptionsLoader,
    private val repository: OrganisationRepository,
    private val overviewRepository: ClassesOverviewRepository,
    private val structure: ClassStructureRepository,
    private val authRepository: AuthRepository,
    private val events: AcademicsEvents,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ClassesUiState(tab = ClassesTab.entries.firstOrNull { it.name == savedStateHandle.get<String>(KEY_TAB) } ?: ClassesTab.CLASSES),
    )
    val uiState: StateFlow<ClassesUiState> = _uiState.asStateFlow()

    private var branchJob: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canAdd = session.has(CLASSES_ADD), canReorder = session.has(CLASSES_EDIT)) }
        }
        viewModelScope.launch { events.changes.collect { refresh() } }
        load()
    }

    fun onTabSelected(tab: ClassesTab) {
        savedStateHandle[KEY_TAB] = tab.name
        _uiState.update { it.copy(tab = tab) }
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        loadOptions(refreshing = false)
    }

    /** Reloads the selected branch while its lists stay visible; a failure keeps them. */
    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        val branchId = _uiState.value.selectedBranchId
        if (branchId == null) loadOptions(refreshing = true) else fetchBranch(branchId, refreshing = true)
    }

    fun onBranchSelected(branchId: String) = fetchBranch(branchId, refreshing = false)

    // --- Add class -------------------------------------------------------------------------------

    fun openAddClass() = _uiState.update { it.copy(addClass = AddClassForm()) }

    fun dismissAddClass() = _uiState.update { it.copy(addClass = null) }

    fun onClassNameChange(name: String) =
        _uiState.update { state -> state.copy(addClass = state.addClass?.copy(name = name, nameError = null, error = null)) }

    fun submitAddClass() {
        val state = _uiState.value
        val form = state.addClass ?: return
        val schoolId = state.schoolId ?: return
        val problem = ClassNameRules.problem(form.name, state.classes.map { it.name })
        if (problem != null) {
            _uiState.update { it.copy(addClass = form.copy(nameError = problem)) }
            return
        }
        _uiState.update { it.copy(addClass = form.copy(saving = true, error = null)) }
        viewModelScope.launch {
            val nextOrder = ((state.classes.mapNotNull { it.levelOrder }.maxOrNull() ?: 0) + 1).coerceAtMost(MAX_LEVEL_ORDER)
            when (val result = structure.createClass(schoolId, form.name, nextOrder)) {
                is AppResult.Failure -> _uiState.update {
                    it.copy(addClass = it.addClass?.copy(saving = false, error = result.error.toActionError()))
                }
                is AppResult.Success -> {
                    _uiState.update { it.copy(addClass = null, openClassId = result.data) }
                    refresh()
                }
            }
        }
    }

    fun onClassOpened() = _uiState.update { it.copy(openClassId = null) }

    // --- Reorder ---------------------------------------------------------------------------------

    fun startReorder() = _uiState.update { it.copy(reorder = it.classes, actionError = null) }

    fun cancelReorder() = _uiState.update { it.copy(reorder = null, reorderSaving = false) }

    fun moveClass(from: Int, to: Int) = _uiState.update { state ->
        val list = state.reorder ?: return@update state
        if (from !in list.indices || to !in list.indices) return@update state
        state.copy(reorder = list.toMutableList().apply { add(to, removeAt(from)) })
    }

    fun saveOrder() {
        val order = _uiState.value.reorder ?: return
        _uiState.update { it.copy(reorderSaving = true, actionError = null) }
        viewModelScope.launch {
            when (val result = structure.reorderClasses(order.map { it.id })) {
                // Keep the draft so the user can retry.
                is AppResult.Failure -> _uiState.update { it.copy(reorderSaving = false, actionError = result.error.toActionError()) }
                is AppResult.Success -> {
                    _uiState.update { it.copy(reorder = null, reorderSaving = false, classes = order) }
                    refresh()
                }
            }
        }
    }

    fun dismissActionError() = _uiState.update { it.copy(actionError = null) }

    // --- Loading ---------------------------------------------------------------------------------

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
        val schoolId = _uiState.value.branches.firstOrNull { it.id == branchId }?.schoolId
        _uiState.update {
            if (refreshing) {
                it.copy(selectedBranchId = branchId, isRefreshing = true)
            } else {
                it.copy(selectedBranchId = branchId, isLoading = true, error = null, sessionName = null, sessionId = null, classes = emptyList())
            }
        }
        branchJob?.cancel()
        branchJob = viewModelScope.launch {
            val active = (repository.sessions(branchId) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
            when (val classes = overviewRepository.overview(branchId, schoolId, active?.id)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = classes.error) }
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        isLoading = false, isRefreshing = false, error = null,
                        sessionId = active?.id, sessionName = active?.name, classes = classes.data,
                    )
                }
            }
        }
    }

    private companion object {
        const val KEY_BRANCH = "branch"
        const val KEY_TAB = "tab"
        const val CLASSES_ADD = "classes.add"
        const val CLASSES_EDIT = "classes.edit"
        const val MAX_LEVEL_ORDER = 100
    }
}
