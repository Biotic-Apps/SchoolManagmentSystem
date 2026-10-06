package com.schoolapp.feature.students.sections

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.people.StudentsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Sections in scope (teacher: own; supervisors: branch) plus a student search across them. */
@OptIn(FlowPreview::class)
@HiltViewModel
class MyClassesViewModel @Inject constructor(
    private val scopedSections: ScopedSections,
    private val studentsRepository: StudentsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(MyClassesUiState())
    val uiState: StateFlow<MyClassesUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch {
            _uiState.map { it.query.trim() }.distinctUntilChanged().debounce(SEARCH_DEBOUNCE_MS).collectLatest(::search)
        }
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            when (val result = scopedSections.load()) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, sections = result.data.sortedWith(compareBy({ s -> s.className }, { s -> s.name })))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    private suspend fun search(query: String) {
        if (query.isEmpty()) {
            _uiState.update { it.copy(isSearching = false, results = emptyList(), searchError = null) }
            return
        }
        _uiState.update { it.copy(isSearching = true, searchError = null) }
        when (val result = studentsRepository.students(search = query)) {
            is AppResult.Success -> _uiState.update { it.copy(isSearching = false, results = result.data) }
            is AppResult.Failure -> _uiState.update { it.copy(isSearching = false, searchError = result.error) }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 350L
    }
}
