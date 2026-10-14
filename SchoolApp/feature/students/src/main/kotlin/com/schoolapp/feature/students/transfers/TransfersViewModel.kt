package com.schoolapp.feature.students.transfers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.transfers.TransfersRepository
import com.schoolapp.core.model.transfers.Transfer
import com.schoolapp.core.model.transfers.TransferDirection
import com.schoolapp.core.model.transfers.TransferFilter
import com.schoolapp.core.model.transfers.TransferStatus
import com.schoolapp.feature.students.add.SectionOptionsLoader
import com.schoolapp.feature.students.paging.Pager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Transfers inbox (web TransfersTab): incoming/outgoing by status; accept into a section, reject or cancel. */
@HiltViewModel
class TransfersViewModel @Inject constructor(
    private val repository: TransfersRepository,
    private val sectionsLoader: SectionOptionsLoader,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransfersUiState())
    val uiState: StateFlow<TransfersUiState> = _uiState.asStateFlow()

    val transfers = Pager<Transfer>(viewModelScope) { page -> repository.page(_uiState.value.branchId, _uiState.value.filter, page) }

    init {
        loadScope()
    }

    fun loadScope() {
        _uiState.update { it.copy(scopeLoading = true, scopeError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canDecide = session.has("students.edit")) }
            when (val result = sectionsLoader.load(session)) {
                is AppResult.Failure -> _uiState.update { it.copy(scopeLoading = false, scopeError = result.error) }
                is AppResult.Success -> {
                    _uiState.update {
                        it.copy(scopeLoading = false, branchId = result.data.branchId.ifBlank { null }, sections = result.data.sections)
                    }
                    transfers.reload()
                }
            }
        }
    }

    fun onDirection(direction: TransferDirection?) = setFilter { it.copy(direction = direction) }

    fun onStatus(status: TransferStatus?) = setFilter { it.copy(status = status) }

    /** Incoming when it goes to this branch (or the list only shows incoming). */
    fun isIncoming(transfer: Transfer): Boolean {
        val s = _uiState.value
        return s.branchId?.let { transfer.toBranchId == it } ?: (s.filter.direction == TransferDirection.IN)
    }

    fun openAccept(transfer: Transfer) = _uiState.update { it.copy(sheet = TransferSheet.Accept(transfer)) }

    fun openClose(transfer: Transfer, action: CloseAction) = _uiState.update { it.copy(sheet = TransferSheet.Close(transfer, action)) }

    fun closeSheet() = _uiState.update { if (it.sheet?.saving == true) it else it.copy(sheet = null) }

    fun onSection(sectionId: String) = updateSheet<TransferSheet.Accept> { it.copy(sectionId = sectionId, sectionMissing = false, error = null) }

    fun onReason(reason: String) = updateSheet<TransferSheet.Close> { it.copy(reason = reason.take(REASON_MAX), reasonError = false, error = null) }

    fun submit() {
        when (val sheet = _uiState.value.sheet) {
            null -> Unit
            is TransferSheet.Accept -> {
                val sectionId = sheet.sectionId ?: return updateSheet<TransferSheet.Accept> { it.copy(sectionMissing = true) }
                run(TransferNotice.ACCEPTED) { repository.accept(sheet.transfer.id, sectionId) }
            }
            is TransferSheet.Close -> {
                if (sheet.reason.trim().length < REASON_MIN) return updateSheet<TransferSheet.Close> { it.copy(reasonError = true) }
                if (sheet.action == CloseAction.REJECT) {
                    run(TransferNotice.REJECTED) { repository.reject(sheet.transfer.id, sheet.reason) }
                } else {
                    run(TransferNotice.CANCELLED) { repository.cancel(sheet.transfer.id, sheet.reason) }
                }
            }
        }
    }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    private fun run(notice: TransferNotice, call: suspend () -> AppResult<Unit>) {
        _uiState.update { it.copy(sheet = it.sheet?.withSaving(true, null)) }
        viewModelScope.launch {
            when (val result = call()) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(sheet = null, notice = notice) }
                    transfers.refresh()
                }
                is AppResult.Failure -> _uiState.update { it.copy(sheet = it.sheet?.withSaving(false, result.error.toActionError())) }
            }
        }
    }

    private fun setFilter(change: (TransferFilter) -> TransferFilter) {
        _uiState.update { it.copy(filter = change(it.filter)) }
        if (!_uiState.value.scopeLoading) transfers.reload()
    }

    private inline fun <reified T : TransferSheet> updateSheet(crossinline change: (T) -> T) =
        _uiState.update { s -> (s.sheet as? T)?.let { s.copy(sheet = change(it)) } ?: s }

    private fun TransferSheet.withSaving(saving: Boolean, error: ActionError?): TransferSheet = when (this) {
        is TransferSheet.Accept -> copy(saving = saving, error = error)
        is TransferSheet.Close -> copy(saving = saving, error = error)
    }

    private companion object {
        const val REASON_MIN = 3
        const val REASON_MAX = 500
    }
}
