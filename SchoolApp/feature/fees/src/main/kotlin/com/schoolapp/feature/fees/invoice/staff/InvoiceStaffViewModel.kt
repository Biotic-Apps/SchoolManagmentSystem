package com.schoolapp.feature.fees.invoice.staff

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.invoices.InvoiceAdminRepository
import com.schoolapp.core.data.fees.scope.FinanceBranchScope
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.fees.Invoice
import com.schoolapp.core.model.fees.InvoiceStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class InvoiceStaffNotice { ISSUED, CANCELLED, CANCEL_SENT }

@Immutable
data class InvoiceStaffUiState(
    val isStaff: Boolean = false,
    val canIssue: Boolean = false,
    val canCancel: Boolean = false,
    val branchId: String? = null,
    val busy: Boolean = false,
    val cancelOpen: Boolean = false,
    val cancelReason: String = "",
    val cancelInvalid: Boolean = false,
    val familyBusy: Boolean = false,
    val notice: InvoiceStaffNotice? = null,
    val error: AppError? = null,
    /** One-shot content uri of the family challan for the route to open. */
    val pdfToOpen: String? = null,
)

/** Staff actions on an invoice: issue a draft, cancel (possibly via approval) and the family challan. */
@HiltViewModel
class InvoiceStaffViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val scope: FinanceBranchScope,
    private val repository: InvoiceAdminRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(InvoiceStaffUiState())
    val uiState: StateFlow<InvoiceStaffUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.first() ?: return@launch
            if (session.activeRole == RoleKey.PARENT || !session.has("fees.view")) return@launch
            val branchId = (scope.current(session) as? AppResult.Success)?.data?.id
            _uiState.update {
                it.copy(isStaff = true, canIssue = session.has("fees.approve"), canCancel = session.has("fees.edit"), branchId = branchId)
            }
        }
    }

    fun issue(invoice: Invoice, onChanged: () -> Unit) = run(onChanged) {
        when (val result = repository.issue(listOf(invoice.id))) {
            is AppResult.Success -> if (result.data.issued > 0) {
                InvoiceStaffNotice.ISSUED to null
            } else {
                null to AppError.Server(HTTP_CONFLICT, null, result.data.failures.firstOrNull())
            }
            is AppResult.Failure -> null to result.error
        }
    }

    fun openCancel() = _uiState.update { it.copy(cancelOpen = true, cancelReason = "", cancelInvalid = false, notice = null, error = null) }

    fun onCancelReason(text: String) = _uiState.update { it.copy(cancelReason = text.take(MAX_REASON), cancelInvalid = false) }

    fun dismissCancel() = _uiState.update { if (it.busy) it else it.copy(cancelOpen = false) }

    fun confirmCancel(invoice: Invoice, onChanged: () -> Unit) {
        val reason = _uiState.value.cancelReason.trim()
        if (reason.length < MIN_REASON) return _uiState.update { it.copy(cancelInvalid = true) }
        run(onChanged) {
            when (val result = repository.cancel(invoice.id, reason)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(cancelOpen = false) }
                    val done = result.data.status == InvoiceStatus.CANCELLED
                    (if (done) InvoiceStaffNotice.CANCELLED else InvoiceStaffNotice.CANCEL_SENT) to null
                }
                is AppResult.Failure -> null to result.error
            }
        }
    }

    fun familyChallan(invoice: Invoice) {
        val branchId = _uiState.value.branchId ?: return
        val studentId = invoice.studentId ?: return
        if (_uiState.value.familyBusy) return
        _uiState.update { it.copy(familyBusy = true, error = null) }
        viewModelScope.launch {
            val result = repository.familyChallan(branchId, listOf(studentId))
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(familyBusy = false, pdfToOpen = result.data)
                    is AppResult.Failure -> it.copy(familyBusy = false, error = result.error)
                }
            }
        }
    }

    fun onPdfOpened() = _uiState.update { it.copy(pdfToOpen = null) }

    private fun run(onChanged: () -> Unit, block: suspend () -> Pair<InvoiceStaffNotice?, AppError?>) {
        if (_uiState.value.busy) return
        _uiState.update { it.copy(busy = true, notice = null, error = null) }
        viewModelScope.launch {
            val (notice, error) = block()
            _uiState.update { it.copy(busy = false, notice = notice, error = error) }
            if (notice != null) onChanged()
        }
    }

    private companion object {
        const val MIN_REASON = 3
        const val MAX_REASON = 500
        const val HTTP_CONFLICT = 409
    }
}
