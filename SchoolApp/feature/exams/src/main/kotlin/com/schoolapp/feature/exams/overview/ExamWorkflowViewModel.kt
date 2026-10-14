package com.schoolapp.feature.exams.overview

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.admin.ExamAdminRepository
import com.schoolapp.core.data.exams.admin.JobFileWaiter
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.admin.ExamConflict
import com.schoolapp.core.model.exams.admin.ExamDetail
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class WorkflowAction { OPEN_MARKS, CLOSE_MARKS, COMPUTE, SEND_FOR_APPROVAL, PUBLISH }

enum class WorkflowMessage { MARKS_OPENED, MARKS_CLOSED, COMPUTED, COMPUTE_RUNNING, SENT_FOR_APPROVAL, PUBLISHED }

@Immutable
data class ExamWorkflowState(
    val canEdit: Boolean = false,
    val canApprove: Boolean = false,
    val canPublish: Boolean = false,
    val running: WorkflowAction? = null,
    val confirm: WorkflowAction? = null,
    val message: WorkflowMessage? = null,
    val error: AppError? = null,
    /** Mark sheets that block sending results for approval (409). */
    val blocking: List<ExamConflict> = emptyList(),
)

/** "Next step" buttons of an exam (web ExamStatusControls), gated by permission and status. */
@HiltViewModel
class ExamWorkflowViewModel @Inject constructor(
    private val repository: ExamAdminRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ExamWorkflowState())
    val state: StateFlow<ExamWorkflowState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _state.update {
                it.copy(canEdit = session.has("exams.edit"), canApprove = session.has("exams.approve"), canPublish = session.has("exams.publish"))
            }
        }
    }

    /** Actions that need a confirm dialog open it first. */
    fun request(action: WorkflowAction, exam: ExamDetail, onChanged: (ExamDetail) -> Unit) {
        if (action == WorkflowAction.CLOSE_MARKS || action == WorkflowAction.PUBLISH) {
            _state.update { it.copy(confirm = action) }
        } else {
            run(action, exam, onChanged)
        }
    }

    fun dismissConfirm() = _state.update { it.copy(confirm = null) }

    fun run(action: WorkflowAction, exam: ExamDetail, onChanged: (ExamDetail) -> Unit) {
        if (_state.value.running != null) return
        _state.update { it.copy(running = action, confirm = null, message = null, error = null, blocking = emptyList()) }
        viewModelScope.launch {
            when (action) {
                WorkflowAction.OPEN_MARKS -> finish(repository.setStatus(exam.id, ExamStatus.MARKS_OPEN), WorkflowMessage.MARKS_OPENED, onChanged)
                WorkflowAction.CLOSE_MARKS -> finish(repository.setStatus(exam.id, ExamStatus.MARKS_CLOSED), WorkflowMessage.MARKS_CLOSED, onChanged)
                WorkflowAction.PUBLISH -> finish(repository.publish(exam.id), WorkflowMessage.PUBLISHED, onChanged)
                WorkflowAction.SEND_FOR_APPROVAL -> sendForApproval(exam, onChanged)
                WorkflowAction.COMPUTE -> compute(exam, onChanged)
            }
        }
    }

    private suspend fun compute(exam: ExamDetail, onChanged: (ExamDetail) -> Unit) {
        when (val result = repository.computeAndWait(exam.id)) {
            is AppResult.Success -> {
                (repository.exam(exam.id) as? AppResult.Success)?.data?.let(onChanged)
                _state.update { it.copy(running = null, message = WorkflowMessage.COMPUTED) }
            }
            is AppResult.Failure -> {
                val stillRunning = (result.error as? AppError.Server)?.code == JobFileWaiter.CODE_NOT_READY
                _state.update {
                    if (stillRunning) it.copy(running = null, message = WorkflowMessage.COMPUTE_RUNNING) else it.copy(running = null, error = result.error)
                }
            }
        }
    }

    private suspend fun sendForApproval(exam: ExamDetail, onChanged: (ExamDetail) -> Unit) {
        when (val result = repository.approveResults(exam.id)) {
            is AppResult.Success -> {
                onChanged(result.data)
                _state.update { it.copy(running = null, message = WorkflowMessage.SENT_FOR_APPROVAL) }
            }
            is AppResult.Failure -> {
                val blocking = repository.conflicts(result.error)
                _state.update { if (blocking.isNotEmpty()) it.copy(running = null, blocking = blocking) else it.copy(running = null, error = result.error) }
            }
        }
    }

    private fun finish(result: AppResult<ExamDetail>, message: WorkflowMessage, onChanged: (ExamDetail) -> Unit) {
        when (result) {
            is AppResult.Success -> {
                onChanged(result.data)
                _state.update { it.copy(running = null, message = message) }
            }
            is AppResult.Failure -> _state.update { it.copy(running = null, error = result.error) }
        }
    }
}
