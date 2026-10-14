package com.schoolapp.feature.questionbank.paper

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.questions.QuestionBankRepository
import com.schoolapp.core.model.questions.ExamPaper
import com.schoolapp.core.model.questions.PaperStatus
import com.schoolapp.feature.questionbank.PaperDetailDestination
import com.schoolapp.feature.questionbank.common.QuestionBankChange
import com.schoolapp.feature.questionbank.common.QuestionBankEvents
import com.schoolapp.feature.questionbank.common.QuestionPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import javax.inject.Inject

/** One generated paper: its sections with the picked questions, PDF download and publish / draft. */
@HiltViewModel
class PaperDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val authRepository: AuthRepository,
    private val repository: QuestionBankRepository,
    private val events: QuestionBankEvents,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<PaperDetailDestination>()

    private val _uiState = MutableStateFlow(PaperDetailUiState(notice = if (route.justGenerated) PaperNotice.GENERATED else null))
    val uiState: StateFlow<PaperDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.paper == null, error = null) }
        viewModelScope.launch {
            val canPublish = QuestionPermissions.of(authRepository.session.first()).canAdd
            when (val result = repository.paper(route.paperId)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isLoading = false, paper = result.data, canPublish = canPublish) }
                    loadQuestions(result.data)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun downloadPdf() {
        val paper = _uiState.value.paper ?: return
        if (_uiState.value.isDownloading) return
        _uiState.update { it.copy(isDownloading = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.downloadPaperPdf(paper)) {
                is AppResult.Success -> _uiState.update { it.copy(isDownloading = false, openUri = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isDownloading = false, actionError = result.error) }
            }
        }
    }

    fun onPdfOpened() = _uiState.update { it.copy(openUri = null) }

    fun onNoticeShown() = _uiState.update { it.copy(notice = null) }

    fun toggleStatus() {
        val paper = _uiState.value.paper ?: return
        if (_uiState.value.isUpdatingStatus) return
        val next = if (paper.status == PaperStatus.PUBLISHED) PaperStatus.DRAFT else PaperStatus.PUBLISHED
        _uiState.update { it.copy(isUpdatingStatus = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.setPaperStatus(paper.id, next)) {
                is AppResult.Success -> {
                    events.post(QuestionBankChange.PAPER_UPDATED, announce = false)
                    val notice = if (next == PaperStatus.PUBLISHED) PaperNotice.PUBLISHED else PaperNotice.MOVED_TO_DRAFT
                    _uiState.update { it.copy(isUpdatingStatus = false, paper = result.data, notice = notice) }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isUpdatingStatus = false, actionError = result.error) }
            }
        }
    }

    /** Fetches the picked questions a few at a time; a failed one is simply left out. */
    private fun loadQuestions(paper: ExamPaper) {
        val ids = paper.sections.flatMap { it.questionIds }.distinct().filterNot { it in _uiState.value.questions }
        if (ids.isEmpty()) return
        _uiState.update { it.copy(questionsLoading = true) }
        viewModelScope.launch {
            val permits = Semaphore(PARALLEL_FETCHES)
            val loaded = ids.map { id -> async { permits.withPermit { (repository.question(id) as? AppResult.Success)?.data } } }
                .awaitAll()
                .filterNotNull()
            _uiState.update { s -> s.copy(questionsLoading = false, questions = s.questions + loaded.associateBy { it.id }) }
        }
    }

    private companion object {
        const val PARALLEL_FETCHES = 4
    }
}
