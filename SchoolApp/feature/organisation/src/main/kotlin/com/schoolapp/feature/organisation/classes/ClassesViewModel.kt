package com.schoolapp.feature.organisation.classes

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ClassesViewModel @Inject constructor(
    private val optionsLoader: BranchOptionsLoader,
    private val repository: OrganisationRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ClassesUiState(tab = savedStateHandle.get<String>(KEY_TAB)?.let(ClassesTab::valueOf) ?: ClassesTab.SECTIONS),
    )
    val uiState: StateFlow<ClassesUiState> = _uiState.asStateFlow()

    private var branchJob: Job? = null

    init {
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
                it.copy(
                    selectedBranchId = branchId, isLoading = true, error = null,
                    sessionName = null, sections = emptyList(), classes = emptyList(), subjects = emptyList(),
                )
            }
        }
        branchJob?.cancel()
        branchJob = viewModelScope.launch {
            val classes = async { repository.classes(schoolId) }
            val subjects = async { repository.subjects(schoolId) }
            val active = (repository.sessions(branchId) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
            val sections = repository.sections(branchId, active?.id)
            val results = listOf(sections, classes.await(), subjects.await())
            val error = results.firstNotNullOfOrNull { (it as? AppResult.Failure)?.error }
            _uiState.update { state ->
                if (error != null) {
                    state.copy(isLoading = false, isRefreshing = false, error = error)
                } else {
                    state.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = null,
                        sessionName = active?.name,
                        sections = sections.dataOrEmpty(),
                        classes = classes.await().dataOrEmpty(),
                        subjects = subjects.await().dataOrEmpty(),
                    )
                }
            }
        }
    }

    private fun <T> AppResult<List<T>>.dataOrEmpty(): List<T> = (this as? AppResult.Success)?.data.orEmpty()

    private companion object {
        const val KEY_BRANCH = "branch"
        const val KEY_TAB = "tab"
    }
}
