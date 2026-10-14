package com.schoolapp.feature.admissions.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.core.model.admissions.TestResult
import com.schoolapp.core.model.admissions.TestSchedule
import com.schoolapp.feature.admissions.R
import com.schoolapp.feature.admissions.common.AdmissionAccess
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Results the Edit and Confirm screens hand back to the detail (nav saved state). */
object DetailResult {
    const val KEY = "admissionsDetailResult"
    const val UPDATED = "updated"
    const val ENROLLED = "enrolled"
}

/** One application and every workflow step on it: test, result, decision, withdraw and documents. */
@HiltViewModel
class ApplicationDetailViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle,
    private val repository: AdmissionsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val applicationId: String = checkNotNull(savedStateHandle["id"]) { "Application id missing" }

    private val _uiState = MutableStateFlow(ApplicationDetailUiState())
    val uiState: StateFlow<ApplicationDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.application == null, loadError = null) }
        viewModelScope.launch {
            val access = AdmissionAccess.of(authRepository.session.first())
            when (val result = repository.application(applicationId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, application = result.data, access = access) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, loadError = result.error) }
            }
        }
    }

    /** Pull-to-refresh, and coming back from edit or confirm. */
    fun refresh() {
        if (_uiState.value.application == null) return load()
        val notice = when (savedStateHandle.remove<String>(DetailResult.KEY)) {
            DetailResult.UPDATED -> R.string.admissions_updated
            DetailResult.ENROLLED -> R.string.admissions_enrolled_notice
            else -> null
        }
        _uiState.update { it.copy(isRefreshing = true, notice = notice ?: it.notice) }
        load()
    }

    fun open(sheet: DetailSheet) = _uiState.update { it.copy(sheet = sheet, actionError = null) }

    fun dismissSheet() = _uiState.update { if (it.busy) it else it.copy(sheet = null, actionError = null) }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    fun decide(decision: AdmissionDecision, reason: String) =
        run(R.string.admissions_decided) { repository.decide(applicationId, decision, reason) }

    fun scheduleTest(schedule: TestSchedule) =
        run(R.string.admissions_test_saved) { repository.scheduleTest(applicationId, schedule) }

    fun recordResult(result: TestResult) =
        run(R.string.admissions_result_saved) { repository.recordTestResult(applicationId, result) }

    fun withdraw(reason: String) = run(R.string.admissions_withdrawn) { repository.withdraw(applicationId, reason) }

    fun upload(docType: String, fileUri: String, note: String) =
        run(R.string.admissions_document_uploaded) { repository.attachDocument(applicationId, docType, fileUri, note) }

    fun verifyDocument(documentId: String, note: String) =
        run(R.string.admissions_document_verified) { repository.verifyDocument(documentId, note) }

    fun rejectDocument(documentId: String, reason: String) =
        run(R.string.admissions_document_rejected) { repository.rejectDocument(documentId, reason) }

    /** Runs one action for the open sheet; on success closes it, shows [notice] and reloads. */
    private fun run(notice: Int, action: suspend () -> AppResult<*>) {
        if (_uiState.value.busy) return
        _uiState.update { it.copy(busy = true, actionError = null) }
        viewModelScope.launch {
            when (val result = action()) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(busy = false, sheet = null, notice = notice) }
                    load()
                }
                is AppResult.Failure -> _uiState.update { it.copy(busy = false, actionError = result.error) }
            }
        }
    }
}
