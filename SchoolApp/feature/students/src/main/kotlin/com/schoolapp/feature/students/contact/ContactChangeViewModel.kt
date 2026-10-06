package com.schoolapp.feature.students.contact

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.model.people.ContactChange
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ContactChangeViewModel @Inject constructor(
    private val repository: GuardiansRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ContactChangeUiState())
    val uiState: StateFlow<ContactChangeUiState> = _uiState.asStateFlow()

    fun onPhoneChange(value: String) = _uiState.update { it.copy(phone = value, fieldError = null, submitError = null) }

    fun onEmailChange(value: String) = _uiState.update { it.copy(email = value, fieldError = null, submitError = null) }

    fun onAddressChange(value: String) = _uiState.update { it.copy(address = value, fieldError = null, submitError = null) }

    fun submit() {
        val state = _uiState.value
        if (state.isSubmitting || state.sent) return
        ContactChangeValidator.validate(state.phone, state.email, state.address)?.let { error ->
            _uiState.update { it.copy(fieldError = error) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, submitError = null) }
        viewModelScope.launch {
            val result = repository.requestContactChange(ContactChange(state.phone, state.email, state.address))
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isSubmitting = false, sent = true)
                    is AppResult.Failure -> it.copy(isSubmitting = false, submitError = result.error)
                }
            }
        }
    }
}
