package com.schoolapp.feature.fees.proof

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.ProofInput
import com.schoolapp.core.model.fees.ProofMethod
import com.schoolapp.core.model.files.FilePurpose
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent: upload a bank/wallet proof for one invoice; the school verifies it before anything is marked paid. */
@HiltViewModel
class ProofUploadViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: FeesRepository,
    private val filesRepository: FilesRepository,
    clock: AppClock,
) : ViewModel() {

    private val invoiceId: String = checkNotNull(savedStateHandle["invoiceId"])
    private val today = clock.now().toLocalDate()

    private val _uiState = MutableStateFlow(ProofUploadUiState(today = today.toString(), paidOn = today.toString()))
    val uiState: StateFlow<ProofUploadUiState> = _uiState.asStateFlow()

    /** Uploaded file id per picked uri, so a retry after a failed submit does not upload again. */
    private var uploaded: Pair<String, String>? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            when (val result = repository.invoice(invoiceId)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        isLoading = false,
                        invoice = result.data,
                        amountText = it.amountText.ifBlank { MoneyFormat.toInput(result.data.balanceMinor) },
                    )
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    fun onAmountChange(text: String) = edit { it.copy(amountText = text) }

    fun onPaidOnChange(date: String) = edit { it.copy(paidOn = date) }

    fun onMethodChange(method: ProofMethod) = edit { it.copy(method = method) }

    fun onReferenceChange(text: String) = edit { it.copy(reference = text) }

    fun onFilePicked(file: PickedFile) = edit { it.copy(file = file) }

    fun onRemoveFile() = edit { it.copy(file = null) }

    fun submit() {
        val state = _uiState.value
        val invoice = state.invoice ?: return
        if (state.isSubmitting || state.submitted) return
        val issues = ProofValidator.validate(state.draft, invoice.balanceMinor, today)
        if (issues.isNotEmpty()) {
            _uiState.update { it.copy(issues = issues) }
            return
        }
        val file = checkNotNull(state.file)
        val amount = checkNotNull(MoneyFormat.parse(state.amountText))
        _uiState.update { it.copy(isSubmitting = true, submitError = null, issues = emptySet()) }
        viewModelScope.launch {
            val fileId = uploaded?.takeIf { it.first == file.uri }?.second ?: when (val upload = filesRepository.upload(file.uri, FilePurpose.ATTACHMENT)) {
                is AppResult.Success -> upload.data.id.also { uploaded = file.uri to it }
                is AppResult.Failure -> {
                    _uiState.update { it.copy(isSubmitting = false, submitError = upload.error) }
                    return@launch
                }
            }
            val input = ProofInput(invoice.id, amount, state.paidOn, state.method, state.reference.trim(), fileId)
            when (val result = repository.submitProof(input)) {
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, submitted = true) }
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, submitError = result.error) }
            }
        }
    }

    /** Edits re-validate only once the user has tried to submit. */
    private fun edit(change: (ProofUploadUiState) -> ProofUploadUiState) {
        _uiState.update { current ->
            if (current.isSubmitting || current.submitted) return@update current
            val next = change(current)
            val balance = next.invoice?.balanceMinor ?: 0L
            if (current.issues.isEmpty()) next else next.copy(issues = ProofValidator.validate(next.draft, balance, today))
        }
    }
}
