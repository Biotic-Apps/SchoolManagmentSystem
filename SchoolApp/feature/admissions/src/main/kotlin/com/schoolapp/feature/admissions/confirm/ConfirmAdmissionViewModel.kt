package com.schoolapp.feature.admissions.confirm

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.admissions.AdmissionFeeStatus
import com.schoolapp.core.model.admissions.ConfirmAdmissionInput
import com.schoolapp.feature.admissions.detail.ActionForms
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.math.BigDecimal
import java.math.RoundingMode
import javax.inject.Inject

@HiltViewModel
class ConfirmAdmissionViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: AdmissionsRepository,
    private val organisation: OrganisationRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val applicationId: String = checkNotNull(savedStateHandle["id"]) { "Application id missing" }

    private val _uiState = MutableStateFlow(ConfirmAdmissionUiState())
    val uiState: StateFlow<ConfirmAdmissionUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        val today = clock.now().toLocalDate().toString()
        _uiState.update { it.copy(isLoading = true, loadError = null, today = today, admissionDate = it.admissionDate.ifBlank { today }) }
        viewModelScope.launch {
            val app = when (val result = repository.application(applicationId)) {
                is AppResult.Failure -> return@launch fail(result.error)
                is AppResult.Success -> result.data
            }
            val branchId = app.branchId ?: return@launch fail(AppError.Unknown())
            when (val sections = organisation.sections(branchId, app.sessionId)) {
                is AppResult.Failure -> fail(sections.error)
                is AppResult.Success -> _uiState.update {
                    val choices = sections.data
                        .filter { s -> s.classId == app.classId && (s.status == null || s.status == ACTIVE) }
                        .sortedBy { s -> s.name }
                        .map { s -> SectionChoice(s.id, s.name, s.studentCount, s.capacity) }
                    it.copy(
                        isLoading = false,
                        childName = app.childName,
                        className = app.className,
                        sections = choices,
                        sectionId = it.sectionId ?: choices.singleOrNull { c -> !c.isFull }?.id,
                    )
                }
            }
        }
    }

    private fun fail(error: AppError) = _uiState.update { it.copy(isLoading = false, loadError = error) }

    fun onSection(id: String) = _uiState.update { it.copy(sectionId = id, problems = it.problems - ConfirmField.SECTION, submitError = null) }

    fun onDate(date: String) = _uiState.update { it.copy(admissionDate = date, problems = it.problems - ConfirmField.DATE) }

    fun onFeeStatus(status: AdmissionFeeStatus) = _uiState.update {
        it.copy(feeStatus = status, problems = it.problems - ConfirmField.FEE_STATUS - ConfirmField.FEE_AMOUNT)
    }

    fun onFeeAmount(value: String) = _uiState.update { it.copy(feeAmount = value.replace(",", "").take(AMOUNT_MAX), problems = it.problems - ConfirmField.FEE_AMOUNT) }

    fun onFeeReference(value: String) = _uiState.update { it.copy(feeReference = value.take(REFERENCE_MAX)) }

    fun submit() {
        val s = _uiState.value
        if (s.submitting || s.confirmed != null) return
        val section = s.sections.firstOrNull { it.id == s.sectionId }
        val paid = s.feeStatus == AdmissionFeeStatus.PAID
        val problems = buildSet {
            if (section == null || section.isFull) add(ConfirmField.SECTION)
            if (s.admissionDate.isBlank()) add(ConfirmField.DATE)
            if (s.feeStatus == null) add(ConfirmField.FEE_STATUS)
            if (paid && !ActionForms.isDecimal(s.feeAmount)) add(ConfirmField.FEE_AMOUNT)
        }
        if (problems.isNotEmpty()) return _uiState.update { it.copy(problems = problems) }
        val amountMinor = if (paid) BigDecimal(s.feeAmount.trim()).movePointRight(2).setScale(0, RoundingMode.HALF_UP).toLong() else null
        val input = ConfirmAdmissionInput(s.feeStatus!!, s.feeReference, amountMinor, section!!.id, s.admissionDate)
        _uiState.update { it.copy(submitting = true, submitError = null) }
        viewModelScope.launch {
            when (val result = repository.confirm(applicationId, input)) {
                is AppResult.Success -> _uiState.update { it.copy(submitting = false, confirmed = result.data) }
                is AppResult.Failure -> {
                    // The only 409 here is a full section (someone took the last seat meanwhile).
                    val full = (result.error as? AppError.Server)?.httpCode == HTTP_CONFLICT
                    _uiState.update {
                        it.copy(submitting = false, submitError = result.error, problems = if (full) it.problems + ConfirmField.SECTION else it.problems)
                    }
                    if (full) load()
                }
            }
        }
    }

    private companion object {
        const val ACTIVE = "ACTIVE"
        const val HTTP_CONFLICT = 409
        const val AMOUNT_MAX = 12
        const val REFERENCE_MAX = 100
    }
}
