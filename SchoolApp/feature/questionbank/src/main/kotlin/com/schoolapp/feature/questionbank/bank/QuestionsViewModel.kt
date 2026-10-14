package com.schoolapp.feature.questionbank.bank

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.questions.QuestionBankRepository
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.Question
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.common.CatalogLoader
import com.schoolapp.feature.questionbank.common.QuestionBankChange
import com.schoolapp.feature.questionbank.common.QuestionBankEvents
import com.schoolapp.feature.questionbank.common.QuestionPermissions
import com.schoolapp.feature.questionbank.common.SchoolOptionsLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Question bank list: school scope, subject / class / type / difficulty filters, search, archive. */
@HiltViewModel
class QuestionsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: QuestionBankRepository,
    private val schoolsLoader: SchoolOptionsLoader,
    private val catalogLoader: CatalogLoader,
    private val events: QuestionBankEvents,
) : ViewModel() {

    private val _uiState = MutableStateFlow(QuestionsUiState())
    val uiState: StateFlow<QuestionsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var searchJob: Job? = null

    init {
        start()
        viewModelScope.launch { events.version.drop(1).collect { load(refreshing = true) } }
    }

    fun retry() = if (_uiState.value.schools.isEmpty()) start() else load(refreshing = false)

    fun refresh() = load(refreshing = true)

    fun onSchoolSelected(id: String) {
        if (id == _uiState.value.schoolId) return
        _uiState.update { it.copy(schoolId = id, subjectId = null, classId = null, catalog = it.catalog.copy(emptyList(), emptyList())) }
        loadCatalog(id)
        load(refreshing = false)
    }

    fun onSubjectSelected(id: String?) = applyFilter { it.copy(subjectId = id) }

    fun onClassSelected(id: String?) = applyFilter { it.copy(classId = id) }

    fun onTypeSelected(key: String?) = applyFilter { it.copy(type = QuestionType.from(key)) }

    fun onDifficultySelected(key: String?) = applyFilter { it.copy(difficulty = Difficulty.from(key)) }

    fun clearFilters() = applyFilter { it.copy(subjectId = null, classId = null, type = null, difficulty = null, search = "") }

    fun onSearchChange(text: String) {
        _uiState.update { it.copy(search = text) }
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            load(refreshing = false)
        }
    }

    fun onOpen(question: Question?) = _uiState.update { it.copy(selected = question, actionError = null) }

    fun onAskArchive(question: Question?) = _uiState.update { it.copy(confirmArchive = question) }

    fun archive() {
        val question = _uiState.value.confirmArchive ?: return
        _uiState.update { it.copy(confirmArchive = null, archivingId = question.id, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.archiveQuestion(question.id)) {
                is AppResult.Success -> {
                    _uiState.update { s -> s.copy(archivingId = null, selected = null, questions = s.questions.filterNot { it.id == question.id }) }
                    events.post(QuestionBankChange.QUESTION_ARCHIVED)
                }
                is AppResult.Failure -> _uiState.update { it.copy(archivingId = null, actionError = result.error) }
            }
        }
    }

    fun loadMore() {
        val state = _uiState.value
        if (!state.canLoadMore || state.isLoadingMore || loadJob?.isActive == true) return
        _uiState.update { it.copy(isLoadingMore = true) }
        loadJob = viewModelScope.launch {
            val next = state.page + 1
            val result = repository.questions(state.filter(), next)
            _uiState.update { s ->
                when (result) {
                    is AppResult.Success -> s.copy(
                        isLoadingMore = false,
                        page = next,
                        questions = (s.questions + result.data).distinctBy { it.id },
                        canLoadMore = result.data.size >= QuestionBankRepository.PAGE_SIZE,
                    )
                    is AppResult.Failure -> s.copy(isLoadingMore = false, actionError = result.error)
                }
            }
        }
    }

    private fun applyFilter(change: (QuestionsUiState) -> QuestionsUiState) {
        _uiState.update(change)
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
        _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null, actionError = null) }
        val result = repository.questions(_uiState.value.filter(), page = 1)
        _uiState.update { s ->
            val base = s.copy(isLoading = false, isRefreshing = false)
            when (result) {
                is AppResult.Success -> base.copy(
                    questions = result.data,
                    page = 1,
                    canLoadMore = result.data.size >= QuestionBankRepository.PAGE_SIZE,
                )
                is AppResult.Failure -> base.copy(error = result.error)
            }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 400L
    }
}
