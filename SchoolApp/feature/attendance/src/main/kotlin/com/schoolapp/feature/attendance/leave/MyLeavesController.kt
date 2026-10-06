package com.schoolapp.feature.attendance.leave

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Shared by the parent (child leave) and staff (own leave) screens: lists MINE requests, validates and
 * sends the request sheet, cancels SUBMITTED ones. [inputFor] returns null when there is no subject.
 */
class MyLeavesController(
    private val repository: LeaveRepository,
    private val scope: CoroutineScope,
    private val withType: Boolean,
    private val defaultDate: () -> String,
    private val inputFor: (LeaveForm) -> LeaveInput?,
    private val include: (LeaveRequest) -> Boolean = { true },
) {
    private val _state = MutableStateFlow(MyLeavesState())
    val state: StateFlow<MyLeavesState> = _state.asStateFlow()

    private var all: List<LeaveRequest> = emptyList()

    suspend fun load() {
        _state.update { it.copy(isLoading = it.items.isEmpty(), error = null) }
        when (val result = repository.leaves(LeaveScope.MINE)) {
            is AppResult.Success -> {
                all = result.data.sortedByDescending { it.createdAt ?: it.from }
                _state.update { it.copy(isLoading = false, items = all.filter(include)) }
            }
            is AppResult.Failure -> _state.update { it.copy(isLoading = false, error = result.error) }
        }
    }

    fun refresh() {
        scope.launch { load() }
    }

    /** Re-applies [include] after the subject (active child) changed. */
    fun refilter() = _state.update { it.copy(items = all.filter(include)) }

    fun openForm() {
        val date = defaultDate()
        _state.update { it.copy(form = LeaveForm(from = date, to = date, type = LeaveType.CASUAL.takeIf { withType }), message = null) }
    }

    fun dismissForm() {
        if (_state.value.form?.isSaving == true) return
        _state.update { it.copy(form = null) }
    }

    fun onTypeChange(type: LeaveType) = editForm { it.copy(type = type) }

    fun onFromChange(date: String) = editForm {
        it.copy(from = date, to = if (it.to.isBlank() || it.to < date) date else it.to, fromMissing = false, rangeInvalid = false)
    }

    fun onToChange(date: String) = editForm { it.copy(to = date, toMissing = false, rangeInvalid = false) }

    fun onReasonChange(reason: String) = editForm { it.copy(reason = reason, reasonMissing = false) }

    fun submit() {
        val current = _state.value.form ?: return
        if (current.isSaving) return
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
                    _state.update { it.copy(form = null, items = all.filter(include), message = LeaveMessage.SENT) }
                }
            }
        }
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

    private fun editForm(transform: (LeaveForm) -> LeaveForm) =
        _state.update { state -> state.copy(form = state.form?.let(transform)) }
}
