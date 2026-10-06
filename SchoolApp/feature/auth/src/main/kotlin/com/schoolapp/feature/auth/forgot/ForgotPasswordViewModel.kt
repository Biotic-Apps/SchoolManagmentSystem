package com.schoolapp.feature.auth.forgot

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.feature.auth.LoginValidator
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ForgotPasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        ForgotPasswordUiState(
            identifier = savedStateHandle[KEY_IDENTIFIER] ?: "",
            sent = savedStateHandle[KEY_SENT] ?: false,
        ),
    )
    val uiState: StateFlow<ForgotPasswordUiState> = _uiState.asStateFlow()

    fun onIdentifierChange(value: String) {
        savedStateHandle[KEY_IDENTIFIER] = value
        _uiState.update { it.copy(identifier = value, identifierError = null, failure = null) }
    }

    fun onSubmit() {
        val current = _uiState.value
        if (current.isSubmitting || current.sent) return
        LoginValidator.identifier(current.identifier)?.let { error ->
            _uiState.update { it.copy(identifierError = error) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            val result = authRepository.requestPasswordReset(current.identifier.trim())
            val error = (result as? AppResult.Failure)?.error?.takeIf { it.isShownToUser() }
            if (error == null) savedStateHandle[KEY_SENT] = true
            _uiState.update { it.copy(isSubmitting = false, sent = error == null, failure = error) }
        }
    }

    /** Only transport/server faults are shown; any answer about the account itself stays neutral. */
    private fun AppError.isShownToUser(): Boolean = when (this) {
        AppError.Network, is AppError.Unknown -> true
        is AppError.Server -> httpCode >= HTTP_SERVER_ERROR
        else -> false
    }

    private companion object {
        const val KEY_IDENTIFIER = "identifier"
        const val KEY_SENT = "sent"
        const val HTTP_SERVER_ERROR = 500
    }
}
