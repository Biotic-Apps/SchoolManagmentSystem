package com.schoolapp.feature.questionbank.papers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.questions.QuestionBankRepository
import com.schoolapp.feature.questionbank.common.Catalog
import com.schoolapp.feature.questionbank.common.CatalogLoader
import com.schoolapp.feature.questionbank.common.QuestionBankEvents
import com.schoolapp.feature.questionbank.common.QuestionPermissions
import com.schoolapp.feature.questionbank.common.SchoolOptionsLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Generated exam papers of a school, filtered by subject and class. */
@HiltViewModel
class PapersViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: QuestionBankRepository,
    private val schoolsLoader: SchoolOptionsLoader,
    private val catalogLoader: CatalogLoader,
    events: QuestionBankEvents,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PapersUiState())
    val uiState: StateFlow<PapersUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        start()
        viewModelScope.launch { events.version.drop(1).collect { load(refreshing = true) } }
    }

    fun retry() = if (_uiState.value.schools.isEmpty()) start() else load(refreshing = false)

    fun refresh() = load(refreshing = true)

    fun onSchoolSelected(id: String) {
        if (id == _uiState.value.schoolId) return
        _uiState.update { it.copy(schoolId = id, subjectId = null, classId = null, catalog = Catalog()) }
        loadCatalog(id)
        load(refreshing = false)
    }

    fun onSubjectSelected(id: String?) {
        _uiState.update { it.copy(subjectId = id) }
        load(refreshing = false)
    }

    fun onClassSelected(id: String?) {
        _uiState.update { it.copy(classId = id) }
        load(refreshing = false)
    }

    private fun start() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val session = authRepository.session.filterNotNull().first()
            when (val schools = schoolsLoader.load(session)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = schools.error) }
                is AppResult.Success -> {
                    val schoolId = schoolsLoader.preferred(session, schools.data)
                    _uiState.update { it.copy(schools = schools.data, schoolId = schoolId, permissions = QuestionPermissions.of(session)) }
                    if (schoolId == null) {
                        _uiState.update { it.copy(isLoading = false) }
                    } else {
                        loadCatalog(schoolId)
                        fetch(refreshing = false)
                    }
                }
            }
        }
    }

    private fun loadCatalog(schoolId: String) {
        viewModelScope.launch {
            val result = catalogLoader.load(schoolId)
            if (result is AppResult.Success && _uiState.value.schoolId == schoolId) _uiState.update { it.copy(catalog = result.data) }
        }
    }

    private fun load(refreshing: Boolean) {
        if (_uiState.value.schoolId == null) return
        loadJob?.cancel()
        loadJob = viewModelScope.launch { fetch(refreshing) }
    }

    private suspend fun fetch(refreshing: Boolean) {
        _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
        val state = _uiState.value
        val result = repository.papers(state.schoolId, state.subjectId, state.classId)
        _uiState.update { s ->
            val base = s.copy(isLoading = false, isRefreshing = false)
            when (result) {
                is AppResult.Success -> base.copy(papers = result.data)
                is AppResult.Failure -> base.copy(error = result.error)
            }
        }
    }
}
