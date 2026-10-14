package com.schoolapp.feature.homework.submit

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.homework.HomeworkRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent view of one homework: details, own submission + feedback, and (re)submit with text and files. */
@HiltViewModel
class SubmitHomeworkViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val authRepository: AuthRepository,
    private val repository: HomeworkRepository,
    private val filesRepository: FilesRepository,
) : ViewModel() {

    private val homeworkId: String = checkNotNull(savedStateHandle["homeworkId"]) { "Homework id missing" }
    private val studentId: String = checkNotNull(savedStateHandle["studentId"]) { "Student id missing" }

    private val _uiState = MutableStateFlow(SubmitHomeworkUiState())
    val uiState: StateFlow<SubmitHomeworkUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val (list, existing) = coroutineScope {
                val list = async { repository.forStudent(studentId) }
                val existing = async { repository.studentSubmission(homeworkId, studentId) }
                list.await() to existing.await()
            }
            val homework = when (list) {
                is AppResult.Failure -> return@launch _uiState.update { it.copy(isLoading = false, loadError = list.error) }
                is AppResult.Success -> list.data.firstOrNull { it.id == homeworkId }
            }
            val submission = when (existing) {
                is AppResult.Failure -> return@launch _uiState.update { it.copy(isLoading = false, loadError = existing.error) }
                is AppResult.Success -> existing.data
            }
            _uiState.update {
                it.copy(isLoading = false, homework = homework, submission = submission, hasSubmitPermission = session.has(SUBMIT_PERMISSION))
            }
        }
    }

    fun onText(value: String) = _uiState.update { it.copy(text = value, emptyError = false, textTooLong = false) }

    fun onAttach(uri: String) {
        val state = _uiState.value
        if (state.isSaving || !state.attachments.canAdd(MAX_FILES)) return
        _uiState.update { it.copy(attachments = it.attachments.started(), uploadError = null, emptyError = false) }
        viewModelScope.launch {
            val result = filesRepository.upload(uri)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(attachments = current.attachments.added(result.data.toAttachment()))
                    is AppResult.Failure -> current.copy(attachments = current.attachments.failed(), uploadError = result.error)
                }
            }
        }
    }

    fun onRemoveAttachment(id: String) = _uiState.update { it.copy(attachments = it.attachments.removed(id)) }

    fun submit() {
        val state = _uiState.value
        if (!state.canSubmit || state.isSaving || state.done || state.attachments.isUploading) return
        val empty = state.text.isBlank() && state.attachments.items.isEmpty()
        val tooLong = state.text.trim().length > TEXT_MAX
        if (empty || tooLong) return _uiState.update { it.copy(emptyError = empty, textTooLong = tooLong) }
        _uiState.update { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.submit(homeworkId, studentId, state.text, state.attachments.fileIds)) {
                is AppResult.Success -> _uiState.update { it.copy(isSaving = false, done = true) }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    internal companion object {
        const val SUBMIT_PERMISSION = "homework.submit"
        const val TEXT_MAX = 4000
        const val MAX_FILES = 10
    }
}
