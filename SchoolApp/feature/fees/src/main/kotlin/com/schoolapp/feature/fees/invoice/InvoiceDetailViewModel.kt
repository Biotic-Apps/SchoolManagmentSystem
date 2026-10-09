package com.schoolapp.feature.fees.invoice

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.fees.InvoicePdfDownloader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent: one invoice with receipts; proof upload / online payment follow the branch fee settings. */
@HiltViewModel
class InvoiceDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: FeesRepository,
    private val challanPdf: InvoicePdfDownloader,
) : ViewModel() {

    private val invoiceId: String = checkNotNull(savedStateHandle["invoiceId"])

    private val _uiState = MutableStateFlow(InvoiceDetailUiState())
    val uiState: StateFlow<InvoiceDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.invoice == null, error = null) }
        viewModelScope.launch {
            when (val result = repository.invoice(invoiceId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val invoice = result.data
                    val summary = invoice.studentId?.let { (repository.feeSummary(it) as? AppResult.Success)?.data }
                    _uiState.update { it.copy(isLoading = false, invoice = invoice, summary = summary ?: it.summary) }
                }
            }
        }
    }

    fun openReceipt(paymentId: String) {
        if (_uiState.value.receiptBusyId != null) return
        _uiState.update { it.copy(receiptBusyId = paymentId, receiptProblem = null) }
        viewModelScope.launch {
            val result = repository.receiptUrl(paymentId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(receiptBusyId = null, urlToOpen = result.data)
                    is AppResult.Failure -> state.copy(receiptBusyId = null, receiptProblem = result.error.toReceiptProblem())
                }
            }
        }
    }

    fun payOnline() {
        val state = _uiState.value
        if (!state.canPayOnline || state.isPayingOnline) return
        _uiState.update { it.copy(isPayingOnline = true, payOnlineError = null) }
        viewModelScope.launch {
            val result = repository.payOnline(invoiceId)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isPayingOnline = false, urlToOpen = result.data)
                    is AppResult.Failure -> it.copy(isPayingOnline = false, payOnlineError = result.error)
                }
            }
        }
    }

    /** Prepares the challan PDF (polling its job) and opens it. */
    fun downloadChallan() {
        if (_uiState.value.isDownloadingChallan) return
        _uiState.update { it.copy(isDownloadingChallan = true, challanError = null) }
        viewModelScope.launch {
            val result = challanPdf(invoiceId)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isDownloadingChallan = false, urlToOpen = result.data)
                    is AppResult.Failure -> it.copy(isDownloadingChallan = false, challanError = result.error)
                }
            }
        }
    }

    fun onUrlOpened() = _uiState.update { it.copy(urlToOpen = null) }

    private fun AppError.toReceiptProblem(): ReceiptProblem =
        if (this is AppError.Server && (httpCode == HTTP_ACCEPTED || code == CODE_NOT_READY)) ReceiptProblem.NotReady else ReceiptProblem.Failed(this)

    private companion object {
        const val HTTP_ACCEPTED = 202
        const val CODE_NOT_READY = "FILE_NOT_READY"
    }
}
