package com.schoolapp.feature.auth

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Navigation after success is driven by the session flow, not by this ViewModel. */
@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        LoginUiState(identifier = savedStateHandle[KEY_IDENTIFIER] ?: ""),
    )
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun onIdentifierChange(value: String) {
        savedStateHandle[KEY_IDENTIFIER] = value
        _uiState.update { it.copy(identifier = value, identifierError = null, failure = null) }
    }

    fun onPasswordChange(value: String) {
        _uiState.update { it.copy(password = value, passwordError = null, failure = null) }
    }

    fun onSubmit() {
        val current = _uiState.value
        if (current.isSubmitting) return
        val identifierError = LoginValidator.identifier(current.identifier)
        val passwordError = LoginValidator.password(current.password)
        if (identifierError != null || passwordError != null) {
            _uiState.update { it.copy(identifierError = identifierError, passwordError = passwordError) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            when (val result = authRepository.login(current.identifier.trim(), current.password)) {
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, password = "") }
                is AppResult.Failure -> _uiState.update {
                    it.copy(isSubmitting = false, failure = result.error.toLoginFailure())
                }
            }
        }
    }

    private companion object {
        const val KEY_IDENTIFIER = "identifier"
    }
}
