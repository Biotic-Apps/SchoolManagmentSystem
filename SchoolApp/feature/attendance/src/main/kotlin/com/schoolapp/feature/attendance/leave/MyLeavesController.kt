package com.schoolapp.feature.attendance.leave

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.model.leave.LeaveType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Shared by the parent (child leave) and staff (own leave) screens: lists MINE requests, validates and
 * sends the request form (with an optional uploaded document), cancels SUBMITTED ones after confirmation.
 * [inputFor] returns null when there is no subject.
 */
class MyLeavesController(
    private val repository: LeaveRepository,
    private val scope: CoroutineScope,
    private val withType: Boolean,
    private val defaultDate: () -> String,
    private val inputFor: (LeaveForm) -> LeaveInput?,
    private val include: (LeaveRequest) -> Boolean = { true },
    private val files: FilesRepository? = null,
) {
    private val _state = MutableStateFlow(MyLeavesState(year = defaultDate().take(YEAR_LENGTH).toIntOrNull() ?: 0))
    val state: StateFlow<MyLeavesState> = _state.asStateFlow()

    private var all: List<LeaveRequest> = emptyList()

    val form = LeaveFormActions(::editForm)

    /** Default day of a new request (today). */
    val today: String get() = defaultDate()

    suspend fun load() {
        _state.update { it.copy(isLoading = it.items.isEmpty() && !it.isRefreshing, error = null) }
        when (val result = repository.leaves(LeaveScope.MINE)) {
            is AppResult.Success -> {
                all = result.data.sortedByDescending { it.createdAt ?: it.from }
                _state.update { it.copy(isLoading = false, isRefreshing = false, items = all.filter(include)) }
            }
            is AppResult.Failure -> _state.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
        }
    }

    fun refresh() {
        scope.launch { load() }
    }

    fun pullRefresh() {
        _state.update { it.copy(isRefreshing = true) }
        refresh()
    }

    /** Re-applies [include] after the subject (active child) changed. */
    fun refilter() = _state.update { it.copy(items = all.filter(include)) }

    fun onFilter(status: LeaveStatus?) = _state.update { it.copy(filter = status) }

    fun openForm() {
        val date = defaultDate()
        _state.update { it.copy(form = LeaveForm(from = date, to = date, type = LeaveType.CASUAL.takeIf { withType }), message = null) }
    }

    fun dismissForm() {
        if (_state.value.form?.isSaving == true) return
        _state.update { it.copy(form = null) }
    }

    fun onTypeChange(type: LeaveType) = form.onTypeChange(type)

    fun onFromChange(date: String) = form.onFromChange(date)

    fun onToChange(date: String) = form.onToChange(date)

    fun onReasonChange(reason: String) = form.onReasonChange(reason)

    fun onAttach(uri: String) {
        val current = _state.value.form ?: return
        val repo = files ?: return
        if (current.isSaving || !current.attachments.canAdd(LeaveForm.MAX_ATTACHMENTS)) return
        editForm { it.copy(attachments = it.attachments.started(), error = null) }
        scope.launch {
            when (val result = repo.upload(uri)) {
                is AppResult.Success -> editForm { it.copy(attachments = it.attachments.added(result.data.toAttachment())) }
                is AppResult.Failure -> editForm { it.copy(attachments = it.attachments.failed(), error = result.error) }
            }
        }
    }

    fun onRemoveAttachment(id: String) = editForm { it.copy(attachments = it.attachments.removed(id)) }

    fun submit() {
        val current = _state.value.form ?: return
        if (current.isSaving || current.attachments.isUploading) return
        val form = LeaveFormValidator.validate(current)
        val input = inputFor(form)
        if (form.hasErrors || input == null) {
            _state.update { it.copy(form = form) }
            return
        }
        _state.update { it.copy(form = form.copy(isSaving = true, error = null)) }
        scope.launch {
            when (val result = repository.request(input)) {
                is AppResult.Failure -> editForm { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> {
                    all = listOf(result.data) + all.filterNot { it.id == result.data.id }
                    _state.update { it.copy(form = null, items = all.filter(include), message = LeaveMessage.SENT, filter = null) }
                }
            }
        }
    }

    /** Asks for confirmation first; [confirmCancel] performs it. */
    fun askCancel(id: String) = _state.update { state ->
        state.copy(confirmCancel = state.items.firstOrNull { it.id == id && it.status == LeaveStatus.SUBMITTED })
    }

    fun dismissCancel() = _state.update { it.copy(confirmCancel = null) }

    fun confirmCancel() {
        val leave = _state.value.confirmCancel ?: return
        _state.update { it.copy(confirmCancel = null) }
        cancel(leave.id)
    }

    fun cancel(id: String) {
        if (_state.value.cancellingId != null) return
        _state.update { it.copy(cancellingId = id, actionError = null, message = null) }
        scope.launch {
            when (val result = repository.cancel(id)) {
                is AppResult.Failure -> _state.update { it.copy(cancellingId = null, actionError = result.error) }
                is AppResult.Success -> {
                    all = all.map { if (it.id == id) result.data else it }
                    _state.update { it.copy(cancellingId = null, items = all.filter(include), message = LeaveMessage.CANCELLED) }
                }
            }
        }
    }

    fun clearMessage() = _state.update { it.copy(message = null, actionError = null) }

    private fun editForm(transform: (LeaveForm) -> LeaveForm) =
        _state.update { state -> state.copy(form = state.form?.let(transform)) }

    private companion object {
        const val YEAR_LENGTH = 4
    }
}
