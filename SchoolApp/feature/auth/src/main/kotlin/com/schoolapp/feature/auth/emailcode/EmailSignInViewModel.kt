package com.schoolapp.feature.auth.emailcode

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.LoginOutcome
import com.schoolapp.feature.auth.toLoginFailure
import com.schoolapp.feature.auth.toOtpFailure
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Parent email + OTP sign-in (contract phase 6 §B). Success follows the session flow like password
 * sign-in; a 2FA challenge is handed to the login screen's shared verification step.
 */
@HiltViewModel
class EmailSignInViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(restoredState())
    val uiState: StateFlow<EmailSignInUiState> = _uiState.asStateFlow()

    private var countdown: Job? = null

    fun onStart() = setActive(true)

    fun onUsePassword() {
        if (_uiState.value.isSubmitting) return
        setActive(false)
        toEmailStep()
    }

    /** System back: from the code step to the email, from the email back to password sign-in. */
    fun onBack() = if (_uiState.value.step == EmailStep.CODE) onChangeEmail() else onUsePassword()

    fun onEmailChange(value: String) {
        savedStateHandle[KEY_EMAIL] = value
        _uiState.update { it.copy(email = value, emailError = null, failure = null) }
    }

    fun onCodeChange(value: String) = _uiState.update { it.copy(code = value, codeError = null, failure = null) }

    fun onSendCode() {
        val current = _uiState.value
        if (current.isSubmitting || current.step != EmailStep.EMAIL) return
        EmailSignInValidator.email(current.email)?.let { error ->
            _uiState.update { it.copy(emailError = error) }
            return
        }
        requestCode(EmailSignInValidator.normalizeEmail(current.email))
    }

    fun onResend() {
        val current = _uiState.value
        if (current.isSubmitting || current.step != EmailStep.CODE || current.resendInSeconds > 0) return
        requestCode(EmailSignInValidator.normalizeEmail(current.email))
    }

    fun onChangeEmail() {
        if (_uiState.value.isSubmitting) return
        toEmailStep()
    }

    fun onVerify() {
        val current = _uiState.value
        if (current.isSubmitting || current.step != EmailStep.CODE) return
        EmailSignInValidator.code(current.code)?.let { error ->
            _uiState.update { it.copy(codeError = error) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            val email = EmailSignInValidator.normalizeEmail(current.email)
            val code = EmailSignInValidator.normalizeCode(current.code)
            when (val result = authRepository.verifyOtp(email, code)) {
                is AppResult.Success -> when (val outcome = result.data) {
                    LoginOutcome.SignedIn -> _uiState.update { it.copy(isSubmitting = false, code = "") }
                    is LoginOutcome.TwoFactorRequired -> handOffTwoFactor(outcome.challengeId)
                }
                is AppResult.Failure -> _uiState.update {
                    it.copy(isSubmitting = false, failure = result.error.toOtpFailure())
                }
            }
        }
    }

    fun onChallengeHandled() = _uiState.update { it.copy(pendingChallengeId = null) }

    private fun requestCode(email: String) {
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            when (val result = authRepository.requestOtp(email)) {
                is AppResult.Success -> {
                    savedStateHandle[KEY_STEP] = EmailStep.CODE.name
                    _uiState.update { it.copy(isSubmitting = false, step = EmailStep.CODE, code = "", codeError = null) }
                    startCountdown(result.data)
                }
                is AppResult.Failure -> _uiState.update {
                    it.copy(isSubmitting = false, failure = result.error.toLoginFailure())
                }
            }
        }
    }

    private fun startCountdown(seconds: Int) {
        countdown?.cancel()
        _uiState.update { it.copy(resendInSeconds = seconds.coerceAtLeast(0)) }
        countdown = viewModelScope.launch {
            while (_uiState.value.resendInSeconds > 0) {
                delay(TICK_MILLIS)
                _uiState.update { it.copy(resendInSeconds = (it.resendInSeconds - 1).coerceAtLeast(0)) }
            }
        }
    }

    private fun handOffTwoFactor(challengeId: String) {
        countdown?.cancel()
        savedStateHandle.remove<Boolean>(KEY_ACTIVE)
        savedStateHandle.remove<String>(KEY_STEP)
        _uiState.update {
            EmailSignInUiState(email = it.email, pendingChallengeId = challengeId)
        }
    }

    private fun setActive(active: Boolean) {
        savedStateHandle[KEY_ACTIVE] = active
        _uiState.update { it.copy(active = active, failure = null, emailError = null, codeError = null) }
    }

    private fun toEmailStep() {
        countdown?.cancel()
        savedStateHandle.remove<String>(KEY_STEP)
        _uiState.update {
            it.copy(step = EmailStep.EMAIL, code = "", codeError = null, failure = null, resendInSeconds = 0)
        }
    }

    private fun restoredState(): EmailSignInUiState {
        val step = EmailStep.entries.firstOrNull { it.name == savedStateHandle.get<String>(KEY_STEP) } ?: EmailStep.EMAIL
        return EmailSignInUiState(
            active = savedStateHandle.get<Boolean>(KEY_ACTIVE) == true,
            step = step,
            email = savedStateHandle.get<String>(KEY_EMAIL).orEmpty(),
        )
    }

    private companion object {
        const val KEY_ACTIVE = "emailSignInActive"
        const val KEY_EMAIL = "emailSignInEmail"
        const val KEY_STEP = "emailSignInStep"
        const val TICK_MILLIS = 1_000L
    }
}
