package com.schoolapp.feature.auth

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.LoginOutcome
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Password step and, when the account uses 2FA, the code step. Navigation after success follows the session flow. */
@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(restoredState())
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
        if (current.isSubmitting || current.step != LoginStep.PASSWORD) return
        val identifierError = LoginValidator.identifier(current.identifier)
        val passwordError = LoginValidator.password(current.password)
        if (identifierError != null || passwordError != null) {
            _uiState.update { it.copy(identifierError = identifierError, passwordError = passwordError) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            when (val result = authRepository.login(current.identifier.trim(), current.password)) {
                is AppResult.Success -> when (val outcome = result.data) {
                    LoginOutcome.SignedIn -> _uiState.update { it.copy(isSubmitting = false, password = "") }
                    is LoginOutcome.TwoFactorRequired -> startTwoFactor(outcome.challengeId)
                }
                is AppResult.Failure -> _uiState.update {
                    it.copy(isSubmitting = false, failure = result.error.toLoginFailure())
                }
            }
        }
    }

    fun onCodeChange(value: String) = updateTwoFactor { it.copy(code = value, codeError = null) }

    fun onToggleCodeMode() {
        val next = when (_uiState.value.twoFactor.mode) {
            TwoFactorMode.AUTHENTICATOR -> TwoFactorMode.RECOVERY
            TwoFactorMode.RECOVERY -> TwoFactorMode.AUTHENTICATOR
        }
        savedStateHandle[KEY_MODE] = next.name
        updateTwoFactor { TwoFactorUiState(mode = next) }
    }

    fun onVerify() {
        val current = _uiState.value
        val challengeId = savedStateHandle.get<String>(KEY_CHALLENGE)
        if (current.isSubmitting || current.step != LoginStep.TWO_FACTOR || challengeId == null) return
        val mode = current.twoFactor.mode
        TwoFactorValidator.validate(mode, current.twoFactor.code)?.let { error ->
            updateTwoFactor { it.copy(codeError = error) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            val code = TwoFactorValidator.normalize(mode, current.twoFactor.code)
            when (val result = authRepository.verifyTwoFactor(challengeId, code)) {
                is AppResult.Success -> {
                    savedStateHandle.remove<String>(KEY_CHALLENGE)
                    _uiState.update { it.copy(isSubmitting = false) }
                }
                is AppResult.Failure -> {
                    val failure = result.error.toTwoFactorFailure()
                    if (failure == LoginFailure.CHALLENGE_EXPIRED) {
                        backToPassword(failure)
                    } else {
                        _uiState.update { it.copy(isSubmitting = false, failure = failure) }
                    }
                }
            }
        }
    }

    fun onBackToSignIn() {
        if (_uiState.value.isSubmitting) return
        backToPassword(failure = null)
    }

    /** An email-code sign-in that also needs 2FA continues on the shared verification step. */
    fun onTwoFactorChallenge(challengeId: String) {
        if (_uiState.value.step == LoginStep.TWO_FACTOR) return
        startTwoFactor(challengeId)
    }

    private fun startTwoFactor(challengeId: String) {
        savedStateHandle[KEY_CHALLENGE] = challengeId
        savedStateHandle[KEY_MODE] = TwoFactorMode.AUTHENTICATOR.name
        _uiState.update {
            it.copy(isSubmitting = false, password = "", step = LoginStep.TWO_FACTOR, twoFactor = TwoFactorUiState())
        }
    }

    private fun backToPassword(failure: LoginFailure?) {
        savedStateHandle.remove<String>(KEY_CHALLENGE)
        savedStateHandle.remove<String>(KEY_MODE)
        _uiState.update {
            it.copy(isSubmitting = false, failure = failure, step = LoginStep.PASSWORD, twoFactor = TwoFactorUiState())
        }
    }

    private fun updateTwoFactor(transform: (TwoFactorUiState) -> TwoFactorUiState) =
        _uiState.update { it.copy(twoFactor = transform(it.twoFactor), failure = null) }

    private fun restoredState(): LoginUiState {
        val identifier = savedStateHandle.get<String>(KEY_IDENTIFIER).orEmpty()
        if (savedStateHandle.get<String>(KEY_CHALLENGE) == null) return LoginUiState(identifier = identifier)
        val mode = TwoFactorMode.entries.firstOrNull { it.name == savedStateHandle.get<String>(KEY_MODE) }
            ?: TwoFactorMode.AUTHENTICATOR
        return LoginUiState(identifier = identifier, step = LoginStep.TWO_FACTOR, twoFactor = TwoFactorUiState(mode))
    }

    private companion object {
        const val KEY_IDENTIFIER = "identifier"
        const val KEY_CHALLENGE = "twoFactorChallenge"
        const val KEY_MODE = "twoFactorMode"
    }
}
