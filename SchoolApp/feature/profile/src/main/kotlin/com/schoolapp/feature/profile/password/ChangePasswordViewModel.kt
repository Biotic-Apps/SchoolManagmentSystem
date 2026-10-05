package com.schoolapp.feature.profile.password

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.code
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChangePasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChangePasswordUiState())
    val uiState: StateFlow<ChangePasswordUiState> = _uiState.asStateFlow()

    fun onCurrentChange(value: String) = _uiState.update { it.copy(current = value, currentError = null, failure = null) }

    fun onNewChange(value: String) = _uiState.update { it.copy(new = value, newError = null, failure = null) }

    fun onConfirmChange(value: String) = _uiState.update { it.copy(confirm = value, confirmError = null, failure = null) }

    fun onSubmit() {
        val s = _uiState.value
        if (s.isSubmitting || s.done) return
        val currentError = PasswordRules.current(s.current)
        val newError = PasswordRules.new(s.new, s.current)
        val confirmError = PasswordRules.confirm(s.confirm, s.new)
        if (currentError != null || newError != null || confirmError != null) {
            _uiState.update { it.copy(currentError = currentError, newError = newError, confirmError = confirmError) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            when (val result = authRepository.changePassword(s.current, s.new)) {
                is AppResult.Success -> _uiState.update { ChangePasswordUiState(done = true) }
                is AppResult.Failure -> _uiState.update { it.withFailure(result.error) }
            }
        }
    }

    private fun ChangePasswordUiState.withFailure(error: AppError) =
        if (error.isWrongCurrentPassword()) {
            copy(isSubmitting = false, currentError = PasswordFieldError.WRONG_CURRENT)
        } else {
            copy(isSubmitting = false, failure = error)
        }

    private fun AppError.isWrongCurrentPassword(): Boolean =
        this == AppError.Unauthorized || code == WRONG_PASSWORD_CODE || this is AppError.Validation

    private companion object {
        const val WRONG_PASSWORD_CODE = "INVALID_CREDENTIALS"
    }
}
