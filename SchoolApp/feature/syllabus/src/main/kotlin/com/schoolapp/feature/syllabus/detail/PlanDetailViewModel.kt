package com.schoolapp.feature.syllabus.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.model.syllabus.ProgressOutcome
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.SyllabusTopic
import com.schoolapp.core.model.syllabus.TopicProgressUpdate
import com.schoolapp.core.model.syllabus.TopicStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

/** Chapters and topics of one plan; teachers update topic progress from a bottom sheet. */
@HiltViewModel
class PlanDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: SyllabusRepository,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val planId: String = checkNotNull(savedStateHandle["planId"]) { "Plan id missing" }
    private val sectionId: String? = savedStateHandle["sectionId"]
    private val subjectId: String? = savedStateHandle["subjectId"]

    private val _uiState = MutableStateFlow(PlanDetailUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<PlanDetailUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch { repository.queuedTopicIds.collect { ids -> _uiState.update { it.copy(queuedTopicIds = ids) } } }
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.plan == null, error = null) }
        viewModelScope.launch {
            val canEdit = authRepository.session.first()?.has(EDIT_PERMISSION) == true
            when (val result = repository.plans(sectionId, subjectId)) {
                is AppResult.Success -> {
                    val plan = result.data.firstOrNull { it.id == planId }
                    _uiState.update { it.copy(isLoading = false, plan = plan, notFound = plan == null, canEdit = canEdit) }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun onTopicSelected(topicId: String) {
        val state = _uiState.value
        if (!state.canEdit) return
        val topic = state.plan?.chapters?.flatMap { it.topics }?.firstOrNull { it.id == topicId } ?: return
        _uiState.update {
            it.copy(
                message = null,
                editor = TopicEditor(
                    topicId = topic.id,
                    topicTitle = topic.title,
                    status = topic.status,
                    completedOn = topic.completedOn ?: state.today,
                    clientRequestId = UUID.randomUUID().toString(),
                ),
            )
        }
    }

    fun onStatusChange(status: TopicStatus) = editEditor { it.copy(status = status, dateMissing = false) }

    fun onCompletedOnChange(date: String) = editEditor { it.copy(completedOn = date, dateMissing = false) }

    fun onNoteChange(note: String) = editEditor { it.copy(note = note) }

    fun onDismissEditor() {
        if (_uiState.value.editor?.isSaving == true) return
        _uiState.update { it.copy(editor = null) }
    }

    fun onMessageShown() = _uiState.update { it.copy(message = null) }

    fun save() {
        val editor = _uiState.value.editor ?: return
        if (editor.isSaving) return
        if (editor.status == TopicStatus.COMPLETED && editor.completedOn.isNullOrBlank()) {
            editEditor { it.copy(dateMissing = true) }
            return
        }
        editEditor { it.copy(isSaving = true, error = null) }
        val update = TopicProgressUpdate(editor.status, editor.completedOn, editor.note)
        viewModelScope.launch {
            when (val result = repository.updateProgress(editor.topicId, update, editor.clientRequestId)) {
                is AppResult.Failure -> editEditor { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> onSaved(editor, update, result.data)
            }
        }
    }

    private fun onSaved(editor: TopicEditor, update: TopicProgressUpdate, outcome: ProgressOutcome) {
        val message = when (outcome) {
            ProgressOutcome.Applied -> ProgressMessage.SAVED
            is ProgressOutcome.PendingReview -> ProgressMessage.PENDING_REVIEW
            ProgressOutcome.Queued -> ProgressMessage.QUEUED
        }
        _uiState.update { state ->
            val plan = state.plan?.let { plan ->
                when (outcome) {
                    ProgressOutcome.Applied -> plan.withTopic(editor.topicId) {
                        it.copy(
                            status = update.status,
                            completedOn = update.completedOn.takeIf { update.status == TopicStatus.COMPLETED },
                            pendingReview = false,
                        )
                    }
                    is ProgressOutcome.PendingReview -> plan.withTopic(editor.topicId) { it.copy(pendingReview = true) }
                    ProgressOutcome.Queued -> plan
                }
            }
            state.copy(plan = plan, editor = null, message = message)
        }
    }

    private fun SyllabusPlan.withTopic(
        topicId: String,
        transform: (SyllabusTopic) -> SyllabusTopic,
    ): SyllabusPlan {
        val updated = copy(chapters = chapters.map { ch -> ch.copy(topics = ch.topics.map { if (it.id == topicId) transform(it) else it }) })
        val topics = updated.chapters.flatMap { it.topics }
        val done = topics.count { it.status == TopicStatus.COMPLETED }
        return updated.copy(
            progress = progress.copy(completed = done, percent = if (topics.isEmpty()) 0 else done * 100 / topics.size),
        )
    }

    private fun editEditor(transform: (TopicEditor) -> TopicEditor) =
        _uiState.update { state -> state.copy(editor = state.editor?.let(transform)) }

    private companion object {
        const val EDIT_PERMISSION = "syllabus.edit"
    }
}
