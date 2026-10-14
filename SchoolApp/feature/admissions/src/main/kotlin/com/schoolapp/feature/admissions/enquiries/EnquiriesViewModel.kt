package com.schoolapp.feature.admissions.enquiries

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.admissions.Enquiry
import com.schoolapp.core.model.admissions.EnquiryStatus
import com.schoolapp.core.model.admissions.EnquiryUpdate
import com.schoolapp.feature.admissions.R
import com.schoolapp.feature.admissions.common.AdmissionAccess
import com.schoolapp.feature.admissions.common.AdmissionScopeLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Enquiries tab: list, add, follow-up (status / date / notes) and convert to an application. */
@HiltViewModel
class EnquiriesViewModel @Inject constructor(
    private val repository: AdmissionsRepository,
    private val authRepository: AuthRepository,
    private val scopeLoader: AdmissionScopeLoader,
) : ViewModel() {

    private val _uiState = MutableStateFlow(EnquiriesUiState())
    val uiState: StateFlow<EnquiriesUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.enquiries.isEmpty() && !it.isRefreshing, error = null) }
        viewModelScope.launch {
            val access = AdmissionAccess.of(authRepository.session.first())
            when (val result = repository.enquiries(null)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error, access = access) }
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, enquiries = result.data, access = access) }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun onFilter(status: EnquiryStatus?) = _uiState.update { it.copy(filter = status) }

    fun onQuery(query: String) = _uiState.update { it.copy(query = query) }

    fun open(sheet: EnquirySheet) {
        _uiState.update { it.copy(sheet = sheet, actionError = null) }
        if (sheet == EnquirySheet.Add) loadScope()
    }

    fun dismissSheet() = _uiState.update { if (it.busy) it else it.copy(sheet = null, actionError = null) }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    fun convertedOpened() = _uiState.update { it.copy(convertedApplicationId = null) }

    fun loadScope() {
        if (_uiState.value.scope?.error == null && _uiState.value.scope != null) return
        _uiState.update { it.copy(scope = null) }
        viewModelScope.launch {
            val scope = scopeLoader.load()
            _uiState.update { it.copy(scope = scope, draft = it.draft.copy(classId = it.draft.classId ?: scope.classes.singleOrNull()?.id)) }
        }
    }

    fun onDraft(draft: EnquiryDraft) = _uiState.update {
        it.copy(draft = draft, draftProblems = if (it.draftProblems.isEmpty()) it.draftProblems else draft.problems())
    }

    fun create() {
        val s = _uiState.value
        val branchId = s.scope?.branchId
        val sessionId = s.scope?.sessionId
        val problems = s.draft.problems()
        if (problems.isNotEmpty()) return _uiState.update { it.copy(draftProblems = problems) }
        if (branchId == null || sessionId == null) return
        run(R.string.admissions_enquiry_added, onSuccess = { it.copy(draft = EnquiryDraft(), draftProblems = emptySet()) }) {
            repository.createEnquiry(s.draft.toInput(branchId, sessionId))
        }
    }

    /** [status] is sent only when it changed (a converted enquiry keeps its status). */
    fun update(enquiry: Enquiry, status: EnquiryStatus, followUpDate: String, notes: String) {
        val update = EnquiryUpdate(status.takeIf { it != enquiry.status }, notes, followUpDate)
        run(R.string.admissions_enquiry_updated) { repository.updateEnquiry(enquiry.id, update) }
    }

    fun convert(enquiry: Enquiry, gender: String, dob: String) {
        run(R.string.admissions_enquiry_converted, onSuccess = { it }) { repository.convertEnquiry(enquiry.id, gender, dob.ifBlank { null }) }
    }

    private fun <T> run(
        notice: Int,
        onSuccess: (EnquiriesUiState) -> EnquiriesUiState = { it },
        action: suspend () -> AppResult<T>,
    ) {
        if (_uiState.value.busy) return
        _uiState.update { it.copy(busy = true, actionError = null) }
        viewModelScope.launch {
            when (val result = action()) {
                is AppResult.Success -> {
                    _uiState.update {
                        onSuccess(it).copy(
                            busy = false,
                            sheet = null,
                            notice = notice,
                            convertedApplicationId = result.data as? String,
                        )
                    }
                    load()
                }
                is AppResult.Failure -> _uiState.update { it.copy(busy = false, actionError = result.error) }
            }
        }
    }
}
