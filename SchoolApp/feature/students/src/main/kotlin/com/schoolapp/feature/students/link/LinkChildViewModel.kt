package com.schoolapp.feature.students.link

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.model.people.GuardianRelation
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/** Parent links another child: admission no + DOB + relation -> OTP to the school's phone -> approval request. */
@HiltViewModel
class LinkChildViewModel @Inject constructor(
    private val repository: GuardiansRepository,
    clock: AppClock,
) : ViewModel() {

    private val today: LocalDate = clock.now().toLocalDate()

    private val _uiState = MutableStateFlow(LinkChildUiState(today = today.toString()))
    val uiState: StateFlow<LinkChildUiState> = _uiState.asStateFlow()

    fun onAdmissionNoChange(value: String) = edit { it.copy(admissionNo = value, errors = it.errors - LinkFieldError.ADMISSION_REQUIRED) }

    fun onDobChange(value: String) =
        edit { it.copy(dob = value, errors = it.errors - LinkFieldError.DOB_REQUIRED - LinkFieldError.DOB_IN_FUTURE) }

    fun onRelationChange(value: GuardianRelation) = edit { it.copy(relation = value, errors = it.errors - LinkFieldError.RELATION_REQUIRED) }

    fun onCodeChange(value: String) = edit { it.copy(code = value.filter(Char::isDigit).take(MAX_CODE), errors = emptySet()) }

    fun sendCode() {
        val state = _uiState.value
        if (state.isSubmitting || state.step != LinkStep.DETAILS) return
        val errors = LinkChildValidator.validateDetails(state.admissionNo, state.dob, state.relation, today)
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, submitError = null) }
        viewModelScope.launch {
            val result = repository.startChildLink(state.admissionNo, checkNotNull(state.dob), checkNotNull(state.relation))
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(
                        isSubmitting = false,
                        step = LinkStep.CODE,
                        requestId = result.data.requestId,
                        maskedPhone = result.data.maskedPhone,
                        devCode = result.data.devCode,
                    )
                    is AppResult.Failure -> it.copy(isSubmitting = false, submitError = result.error)
                }
            }
        }
    }

    fun verify() {
        val state = _uiState.value
        val requestId = state.requestId ?: return
        if (state.isSubmitting || state.step != LinkStep.CODE) return
        LinkChildValidator.validateCode(state.code)?.let { error ->
            _uiState.update { it.copy(errors = setOf(error)) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, submitError = null) }
        viewModelScope.launch {
            val result = repository.confirmChildLink(requestId, state.code)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isSubmitting = false, step = LinkStep.DONE)
                    is AppResult.Failure -> it.copy(isSubmitting = false, submitError = result.error)
                }
            }
        }
    }

    /** Back from the code step returns to the details so a wrong admission no can be fixed. */
    fun backToDetails() = edit { it.copy(step = LinkStep.DETAILS, code = "", requestId = null, maskedPhone = null, devCode = null) }

    private fun edit(transform: (LinkChildUiState) -> LinkChildUiState) =
        _uiState.update { transform(it).copy(submitError = null) }

    private companion object {
        const val MAX_CODE = 8
    }
}
