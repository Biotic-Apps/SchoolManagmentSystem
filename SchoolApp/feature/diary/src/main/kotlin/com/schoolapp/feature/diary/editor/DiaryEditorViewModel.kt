package com.schoolapp.feature.diary.editor

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.feature.diary.subjects.TeacherSubjects
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
import java.util.UUID
import javax.inject.Inject

/** Writes one section's diary for a date; [clientRequestId] is fixed for the whole editor session so retries are not applied twice. */
@HiltViewModel
class DiaryEditorViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val diaryRepository: DiaryRepository,
    private val filesRepository: FilesRepository,
    private val teacherSubjects: TeacherSubjects,
    private val scopedSections: ScopedSections,
    private val authRepository: AuthRepository,
    private val results: DiaryEditResults,
) : ViewModel() {

    private val sectionId: String = checkNotNull(savedStateHandle["sectionId"]) { "Section id missing" }
    private val date: String = checkNotNull(savedStateHandle["date"]) { "Date missing" }
    private val initialSubjectId: String? = savedStateHandle["subjectId"]

    val clientRequestId: String = UUID.randomUUID().toString()

    private var dayEntries: List<DiaryEntry> = emptyList()

    private val _uiState = MutableStateFlow(DiaryEditorUiState(title = savedStateHandle["title"], date = date))
    val uiState: StateFlow<DiaryEditorUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val isHelper = session.activeRole == RoleKey.HELPER
            val isStaff = isHelper || session.activeRole == RoleKey.TEACHER
            val (allResult, entriesResult) = coroutineScope {
                val all = async { teacherSubjects.all() }
                val entries = async { diaryRepository.entries(sectionId, date = date) }
                all.await() to entries.await()
            }
            val all = when (allResult) {
                is AppResult.Failure -> return@launch fail(allResult.error)
                is AppResult.Success -> allResult.data
            }
            dayEntries = when (entriesResult) {
                is AppResult.Failure -> return@launch fail(entriesResult.error)
                is AppResult.Success -> entriesResult.data.filter { it.date == date }
            }
            val options = withEntrySubjects(if (isStaff) taughtOrAll(all) else all, all)
            val subjectId = initialSubjectId ?: options.singleOrNull()?.id
            _uiState.update {
                it.copy(
                    isLoading = false,
                    subjects = options,
                    isHelper = isHelper,
                    canEdit = session.has(EDIT_PERMISSION),
                    canPublish = !isHelper && session.has(PUBLISH_PERMISSION),
                ).withSubject(subjectId)
            }
        }
    }

    fun onSubjectSelected(subjectId: String) {
        if (_uiState.value.isBusy || _uiState.value.isReadOnly) return
        _uiState.update { it.withSubject(subjectId).copy(subjectMissing = false, error = null) }
    }

    fun onTopicsChange(value: String) = _uiState.update { it.copy(topics = value, topicsMissing = false) }

    fun onHomeworkChange(value: String) = _uiState.update { it.copy(homework = value) }

    fun onDueDateChange(value: String?) = _uiState.update { it.copy(dueDate = value, dueDateInvalid = false) }

    fun onFilePicked(uri: String) {
        if (_uiState.value.isBusy) return
        _uiState.update { it.copy(isUploading = true, uploadError = null) }
        viewModelScope.launch {
            when (val result = filesRepository.upload(uri)) {
                is AppResult.Failure -> _uiState.update { it.copy(isUploading = false, uploadError = result.error) }
                is AppResult.Success -> {
                    val file = result.data
                    val attachment = EditorAttachment(file.id, file.name.orEmpty(), file.url, file.mime?.startsWith("image/") == true)
                    _uiState.update { it.copy(isUploading = false, attachments = it.attachments + attachment) }
                }
            }
        }
    }

    fun onRemoveAttachment(id: String) = _uiState.update { state -> state.copy(attachments = state.attachments.filterNot { it.id == id }) }

    fun onUploadErrorShown() = _uiState.update { it.copy(uploadError = null) }

    fun saveDraft() = submit(EditorAction.SAVE_DRAFT)

    fun publish() = submit(EditorAction.PUBLISH)

    private fun submit(action: EditorAction) {
        val state = _uiState.value
        if (state.isBusy || state.isReadOnly) return
        if (action == EditorAction.PUBLISH && !state.canPublish) return
        val subjectId = state.subjectId
        val subjectMissing = subjectId == null
        val topicsMissing = state.topics.isBlank()
        val dueDateInvalid = state.dueDate != null && state.dueDate < date
        if (subjectMissing || topicsMissing || dueDateInvalid) {
            _uiState.update { it.copy(subjectMissing = subjectMissing, topicsMissing = topicsMissing, dueDateInvalid = dueDateInvalid) }
            return
        }
        val input = DiaryInput(
            sectionId = sectionId,
            subjectId = checkNotNull(subjectId),
            date = date,
            topics = state.topics.trim(),
            homework = state.homework.trim().ifBlank { null },
            dueDate = state.dueDate?.takeIf { state.homework.isNotBlank() },
            attachmentFileIds = state.attachments.map { it.id },
        )
        _uiState.update { it.copy(busyAction = action, error = null) }
        viewModelScope.launch {
            val result = when (action) {
                EditorAction.SAVE_DRAFT -> diaryRepository.saveDraft(input, clientRequestId)
                EditorAction.PUBLISH -> diaryRepository.publish(input, state.entry?.id, clientRequestId)
            }
            when (result) {
                is AppResult.Failure -> onFailure(result.error)
                is AppResult.Success -> finish(resultFor(action, result.data))
            }
        }
    }

    private fun onFailure(error: AppError) {
        val locked = error is AppError.Server && error.httpCode == HTTP_LOCKED
        _uiState.update { it.copy(busyAction = null, locked = it.locked || locked, error = error.takeUnless { locked }) }
    }

    private fun finish(result: DiaryEditResult) {
        results.post(result)
        _uiState.update { it.copy(busyAction = null, result = result) }
    }

    private fun resultFor(action: EditorAction, outcome: DiaryOutcome): DiaryEditResult = when (outcome) {
        DiaryOutcome.Queued -> DiaryEditResult.QUEUED
        is DiaryOutcome.PendingReview -> DiaryEditResult.PENDING_REVIEW
        is DiaryOutcome.Saved -> when {
            action == EditorAction.SAVE_DRAFT -> DiaryEditResult.DRAFT_SAVED
            outcome.entry.status == DiaryStatus.PUBLISHED -> DiaryEditResult.PUBLISHED
            outcome.entry.status == DiaryStatus.DRAFT -> DiaryEditResult.DRAFT_SAVED
            else -> DiaryEditResult.PENDING_REVIEW
        }
    }

    private suspend fun taughtOrAll(all: List<Subject>): List<Subject> {
        val section = (scopedSections.load() as? AppResult.Success)?.data?.firstOrNull { it.id == sectionId } ?: return all
        val taught = teacherSubjects.taught(date, listOf(section), all, onDateOnly = false)[section.id] ?: return all
        return if (taught.complete && taught.subjects.isNotEmpty()) taught.subjects else all
    }

    /** Keeps subjects that already have an entry (or were requested) selectable even if the timetable missed them. */
    private fun withEntrySubjects(options: List<Subject>, all: List<Subject>): List<Subject> {
        val extraIds = (dayEntries.mapNotNull { it.subjectId } + listOfNotNull(initialSubjectId)).filter { id -> options.none { it.id == id } }
        val extras = extraIds.distinct().map { id ->
            all.firstOrNull { it.id == id } ?: Subject(id, null, dayEntries.firstOrNull { it.subjectId == id }?.subjectName ?: id)
        }
        return options + extras
    }

    private fun DiaryEditorUiState.withSubject(subjectId: String?): DiaryEditorUiState {
        val existing = subjectId?.let { id -> dayEntries.firstOrNull { it.subjectId == id } }
        return when {
            existing != null -> copy(
                subjectId = subjectId,
                entry = existing,
                topics = existing.topics,
                homework = existing.homework.orEmpty(),
                dueDate = existing.dueDate,
                attachments = existing.attachments.map { EditorAttachment(it.id, it.name.orEmpty(), it.url, it.isImage) },
            )
            entry != null -> copy(subjectId = subjectId, entry = null, topics = "", homework = "", dueDate = null, attachments = emptyList())
            else -> copy(subjectId = subjectId)
        }
    }

    private fun fail(error: AppError) = _uiState.update { it.copy(isLoading = false, loadError = error) }

    private companion object {
        const val EDIT_PERMISSION = "diary.edit"
        const val PUBLISH_PERMISSION = "diary.publish"
        const val HTTP_LOCKED = 423
    }
}
