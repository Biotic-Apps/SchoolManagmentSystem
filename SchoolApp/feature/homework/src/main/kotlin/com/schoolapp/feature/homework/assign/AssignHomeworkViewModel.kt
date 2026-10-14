package com.schoolapp.feature.homework.assign

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.homework.HomeworkRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.homework.NewHomework
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Assign homework to one section (web AssignHomeworkDialog). */
@HiltViewModel
class AssignHomeworkViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val homeworkRepository: HomeworkRepository,
    private val organisationRepository: OrganisationRepository,
    private val filesRepository: FilesRepository,
) : ViewModel() {

    private val sectionId: String = checkNotNull(savedStateHandle["sectionId"]) { "Section id missing" }
    private val classId: String? = savedStateHandle["classId"]

    private val _uiState = MutableStateFlow(AssignHomeworkUiState(sectionLabel = savedStateHandle["sectionLabel"] ?: ""))
    val uiState: StateFlow<AssignHomeworkUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val classSubjects = classId?.let { homeworkRepository.classSubjects(it) as? AppResult.Success }?.data
            val subjects = if (!classSubjects.isNullOrEmpty()) {
                classSubjects
            } else {
                when (val all = organisationRepository.subjects(null)) {
                    is AppResult.Failure -> return@launch _uiState.update { it.copy(isLoading = false, loadError = all.error) }
                    is AppResult.Success -> all.data.sortedBy { it.name.lowercase() }
                }
            }
            _uiState.update { it.copy(isLoading = false, subjects = subjects, subjectId = it.subjectId ?: subjects.singleOrNull()?.id) }
        }
    }

    fun onSubject(id: String) = _uiState.update { it.copy(subjectId = id, errors = it.errors - AssignField.SUBJECT) }

    fun onTitle(value: String) = _uiState.update { it.copy(title = value, errors = it.errors - AssignField.TITLE - AssignField.TITLE_LENGTH) }

    fun onDescription(value: String) =
        _uiState.update { it.copy(description = value, errors = it.errors - AssignField.DESCRIPTION - AssignField.DESCRIPTION_LENGTH) }

    fun onDueDate(value: String) = _uiState.update { it.copy(dueDate = value, errors = it.errors - AssignField.DUE_DATE) }

    fun onMaxMarks(value: String) =
        _uiState.update { it.copy(maxMarks = value.filter(Char::isDigit).take(MARKS_DIGITS), errors = it.errors - AssignField.MAX_MARKS) }

    fun onAttach(uri: String) {
        val state = _uiState.value
        if (state.isSaving || !state.attachments.canAdd(AttachmentDraft.DEFAULT_MAX)) return
        _uiState.update { it.copy(attachments = it.attachments.started(), uploadError = null) }
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
        if (state.isSaving || state.done || state.attachments.isUploading) return
        val errors = validate(state)
        if (errors.isNotEmpty()) return _uiState.update { it.copy(errors = errors) }
        val input = NewHomework(
            sectionId = sectionId,
            subjectId = checkNotNull(state.subjectId),
            title = state.title,
            description = state.description,
            dueDate = checkNotNull(state.dueDate),
            maxMarks = state.maxMarks.toIntOrNull(),
            attachmentFileIds = state.attachments.fileIds,
        )
        _uiState.update { it.copy(isSaving = true, error = null, errors = emptySet()) }
        viewModelScope.launch {
            when (val result = homeworkRepository.create(input)) {
                is AppResult.Success -> _uiState.update { it.copy(isSaving = false, done = true) }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun validate(state: AssignHomeworkUiState): Set<AssignField> = buildSet {
        if (state.subjectId == null) add(AssignField.SUBJECT)
        if (state.title.isBlank()) add(AssignField.TITLE) else if (state.title.trim().length > TITLE_MAX) add(AssignField.TITLE_LENGTH)
        if (state.description.isBlank()) {
            add(AssignField.DESCRIPTION)
        } else if (state.description.trim().length > DESCRIPTION_MAX) {
            add(AssignField.DESCRIPTION_LENGTH)
        }
        if (state.dueDate == null) add(AssignField.DUE_DATE)
        val marks = state.maxMarks.takeIf { it.isNotBlank() }?.toIntOrNull()
        if (state.maxMarks.isNotBlank() && (marks == null || marks > MARKS_MAX)) add(AssignField.MAX_MARKS)
    }

    internal companion object {
        const val TITLE_MAX = 500
        const val DESCRIPTION_MAX = 4000
        const val MARKS_MAX = 1000
        const val MARKS_DIGITS = 4
    }
}
