package com.schoolapp.feature.fees.record

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.PaymentInput
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.PaymentOutcome
import com.schoolapp.core.model.people.StudentSummary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

/** Cashier: record a counter payment for a student; offline it is queued and sent later. */
@HiltViewModel
class RecordPaymentViewModel @Inject constructor(
    private val repository: FeesRepository,
    private val studentsRepository: StudentsRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = clock.now().toLocalDate()
    private val _uiState = MutableStateFlow(RecordPaymentUiState(today = today.toString(), receivedOn = today.toString()))
    val uiState: StateFlow<RecordPaymentUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    fun onSearchChange(text: String) {
        _uiState.update { it.copy(search = text, searchError = null) }
        searchJob?.cancel()
        val query = text.trim()
        if (query.length < MIN_QUERY) {
            _uiState.update { it.copy(results = emptyList(), isSearching = false) }
            return
        }
        searchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            _uiState.update { it.copy(isSearching = true) }
            val result = studentsRepository.students(search = query)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isSearching = false, results = result.data.take(MAX_RESULTS))
                    is AppResult.Failure -> it.copy(isSearching = false, searchError = result.error)
                }
            }
        }
    }

    fun onStudentSelected(student: StudentSummary) {
        searchJob?.cancel()
        edit { it.copy(student = student, search = "", results = emptyList(), isSearching = false) }
    }

    fun onClearStudent() = edit { it.copy(student = null) }

    fun onAmountChange(text: String) = edit { it.copy(amountText = text) }

    fun onMethodChange(method: PaymentMethod) = edit { it.copy(method = method) }

    fun onReferenceChange(text: String) = edit { it.copy(reference = text) }

    fun onReceivedOnChange(date: String) = edit { it.copy(receivedOn = date) }

    fun submit() {
        val state = _uiState.value
        if (state.isSaving || state.result != null) return
        val issues = validate(state)
        if (issues.isNotEmpty()) {
            _uiState.update { it.copy(issues = issues) }
            return
        }
        val input = PaymentInput(
            studentId = checkNotNull(state.student).id,
            amountMinor = checkNotNull(MoneyFormat.parse(state.amountText)),
            method = state.method,
            reference = state.reference.trim().takeIf { it.isNotEmpty() },
            receivedOn = state.receivedOn,
        )
        val attempt = state.pending?.takeIf { it.input == input } ?: PendingPayment(input, UUID.randomUUID().toString())
        _uiState.update { it.copy(isSaving = true, error = null, issues = emptySet(), pending = attempt) }
        viewModelScope.launch {
            val result = repository.recordPayment(attempt.input, attempt.clientRequestId)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Failure -> current.copy(isSaving = false, error = result.error)
                    is AppResult.Success -> current.copy(
                        isSaving = false,
                        pending = null,
                        result = when (val outcome = result.data) {
                            is PaymentOutcome.Recorded -> RecordResult.Recorded(
                                receiptNo = outcome.payment.receiptNo,
                                amountMinor = outcome.payment.amountMinor,
                                studentName = outcome.payment.studentName ?: current.student?.name,
                            )
                            PaymentOutcome.Queued -> RecordResult.Queued
                        },
                    )
                }
            }
        }
    }

    /** Clears the form for the next payment (keeps the date and method). */
    fun recordAnother() = _uiState.update {
        RecordPaymentUiState(today = it.today, receivedOn = it.receivedOn, method = it.method)
    }

    private fun validate(state: RecordPaymentUiState): Set<PaymentIssue> =
        RecordPaymentValidator.validate(state.student?.id, state.amountText, state.method, state.reference, state.receivedOn, today)

    private fun edit(change: (RecordPaymentUiState) -> RecordPaymentUiState) {
        _uiState.update { current ->
            if (current.isSaving || current.result != null) return@update current
            val next = change(current)
            if (current.issues.isEmpty()) next else next.copy(issues = validate(next))
        }
    }

    private companion object {
        const val MIN_QUERY = 2
        const val MAX_RESULTS = 20
        const val SEARCH_DEBOUNCE_MS = 300L
    }
}
