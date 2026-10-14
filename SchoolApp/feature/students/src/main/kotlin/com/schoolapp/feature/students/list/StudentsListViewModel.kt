package com.schoolapp.feature.students.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.students.list.StudentListRepository
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.students.list.StudentListFilter
import com.schoolapp.feature.students.add.SectionOptionsLoader
import com.schoolapp.feature.students.paging.Pager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Students of the branch's active session, filtered by class, section and status (Active by default) and
 * searched by name or admission number, loaded page by page (web use-students-tab).
 */
@OptIn(FlowPreview::class)
@HiltViewModel
class StudentsListViewModel @Inject constructor(
    private val repository: StudentListRepository,
    private val sectionsLoader: SectionOptionsLoader,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentsListUiState())
    val uiState: StateFlow<StudentsListUiState> = _uiState.asStateFlow()

    val students = Pager<StudentSummary>(viewModelScope) { page ->
        val s = _uiState.value
        repository.page(s.filter.copy(search = s.query.trim().takeIf { it.length >= MIN_SEARCH }), page)
    }

    init {
        loadScope()
        viewModelScope.launch {
            _uiState.map { it.query.trim().takeIf { q -> q.length >= MIN_SEARCH }.orEmpty() }
                .distinctUntilChanged().drop(1).debounce(SEARCH_DEBOUNCE_MS).collect { students.reload() }
        }
    }

    fun loadScope() {
        _uiState.update { it.copy(scopeLoading = true, scopeError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update {
                it.copy(
                    canAdd = session.has("students.add"),
                    canPrintSlips = session.has("guardians.edit") && session.has("users.edit"),
                    canPrintCards = session.has("students.edit"),
                )
            }
            when (val result = sectionsLoader.load(session)) {
                is AppResult.Failure -> _uiState.update { it.copy(scopeLoading = false, scopeError = result.error) }
                is AppResult.Success -> {
                    val scope = result.data
                    _uiState.update {
                        it.copy(
                            scopeLoading = false,
                            sections = scope.sections,
                            filter = it.filter.copy(branchId = scope.branchId.ifBlank { null }, sessionId = scope.sessionId),
                        )
                    }
                    students.reload()
                }
            }
        }
    }

    fun onTab(tab: StudentsTab) = _uiState.update { it.copy(tab = tab) }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    fun onClass(classId: String?) = applyFilter { it.copy(classId = classId, sectionId = null) }

    fun onSection(sectionId: String?) = applyFilter { it.copy(sectionId = sectionId) }

    fun onStatus(status: String?) = applyFilter { it.copy(status = status) }

    fun showLoginSlips(show: Boolean) = _uiState.update { it.copy(showLoginSlips = show) }

    fun showIdCards(show: Boolean) = _uiState.update { it.copy(showIdCards = show) }

    private fun applyFilter(change: (StudentListFilter) -> StudentListFilter) {
        val before = _uiState.value.filter
        _uiState.update { it.copy(filter = change(it.filter)) }
        if (_uiState.value.filter != before && !_uiState.value.scopeLoading) students.reload()
    }

    private companion object {
        const val MIN_SEARCH = 2
        const val SEARCH_DEBOUNCE_MS = 350L
    }
}
