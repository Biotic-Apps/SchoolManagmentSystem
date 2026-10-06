package com.schoolapp.feature.auth.reset

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ResetPasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ResetPasswordUiState(token = savedStateHandle[KEY_TOKEN] ?: "", done = savedStateHandle[KEY_DONE] ?: false),
    )
    val uiState: StateFlow<ResetPasswordUiState> = _uiState.asStateFlow()

    fun onTokenChange(value: String) {
        savedStateHandle[KEY_TOKEN] = value
        _uiState.update { it.copy(token = value, tokenError = null, failure = null) }
    }

    fun onNewChange(value: String) = _uiState.update { it.copy(newPassword = value, newError = null, failure = null) }

    fun onConfirmChange(value: String) = _uiState.update { it.copy(confirm = value, confirmError = null, failure = null) }

    fun onSubmit() {
        val s = _uiState.value
        if (s.isSubmitting || s.done) return
        val tokenError = ResetPasswordRules.token(s.token)
        val newError = ResetPasswordRules.new(s.newPassword)
        val confirmError = ResetPasswordRules.confirm(s.confirm, s.newPassword)
        if (tokenError != null || newError != null || confirmError != null) {
            _uiState.update { it.copy(tokenError = tokenError, newError = newError, confirmError = confirmError) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            when (val result = authRepository.resetPassword(s.token.trim(), s.newPassword)) {
                is AppResult.Success -> {
                    savedStateHandle.remove<String>(KEY_TOKEN)
                    savedStateHandle[KEY_DONE] = true
                    _uiState.update { ResetPasswordUiState(done = true) }
                }
                is AppResult.Failure -> _uiState.update {
                    it.copy(isSubmitting = false, failure = result.error.toResetFailure())
                }
            }
        }
    }

    private fun AppError.toResetFailure(): ResetFailure = when {
        this is AppError.Validation || this == AppError.Unauthorized -> ResetFailure.InvalidCode
        this is AppError.Server && httpCode in INVALID_CODE_STATUSES -> ResetFailure.InvalidCode
        else -> ResetFailure.Error(this)
    }

    private companion object {
        const val KEY_TOKEN = "resetToken"
        const val KEY_DONE = "resetDone"
        val INVALID_CODE_STATUSES = setOf(400, 404, 410)
    }
}
