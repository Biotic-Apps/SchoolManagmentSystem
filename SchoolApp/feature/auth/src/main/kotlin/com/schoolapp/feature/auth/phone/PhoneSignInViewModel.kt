package com.schoolapp.feature.auth.phone

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
 * Parent phone + OTP sign-in (contract phase 6 §B). Success follows the session flow like password
 * sign-in; a 2FA challenge is handed to the login screen's shared verification step.
 */
@HiltViewModel
class PhoneSignInViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _uiState = MutableStateFlow(restoredState())
    val uiState: StateFlow<PhoneSignInUiState> = _uiState.asStateFlow()

    private var countdown: Job? = null

    fun onStart() = setActive(true)

    fun onUsePassword() {
        if (_uiState.value.isSubmitting) return
        setActive(false)
        toPhoneStep()
    }

    /** System back: from the code step to the number, from the number back to password sign-in. */
    fun onBack() = if (_uiState.value.step == PhoneStep.CODE) onChangeNumber() else onUsePassword()

    fun onPhoneChange(value: String) {
        savedStateHandle[KEY_PHONE] = value
        _uiState.update { it.copy(phone = value, phoneError = null, failure = null) }
    }

    fun onCodeChange(value: String) = _uiState.update { it.copy(code = value, codeError = null, failure = null) }

    fun onSendCode() {
        val current = _uiState.value
        if (current.isSubmitting || current.step != PhoneStep.PHONE) return
        PhoneSignInValidator.phone(current.phone)?.let { error ->
            _uiState.update { it.copy(phoneError = error) }
            return
        }
        requestCode(PhoneSignInValidator.normalizePhone(current.phone))
    }

    fun onResend() {
        val current = _uiState.value
        if (current.isSubmitting || current.step != PhoneStep.CODE || current.resendInSeconds > 0) return
        requestCode(PhoneSignInValidator.normalizePhone(current.phone))
    }

    fun onChangeNumber() {
        if (_uiState.value.isSubmitting) return
        toPhoneStep()
    }

    fun onVerify() {
        val current = _uiState.value
        if (current.isSubmitting || current.step != PhoneStep.CODE) return
        PhoneSignInValidator.code(current.code)?.let { error ->
            _uiState.update { it.copy(codeError = error) }
            return
        }
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            val phone = PhoneSignInValidator.normalizePhone(current.phone)
            val code = PhoneSignInValidator.normalizeCode(current.code)
            when (val result = authRepository.verifyOtp(phone, code)) {
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

    private fun requestCode(phone: String) {
        _uiState.update { it.copy(isSubmitting = true, failure = null) }
        viewModelScope.launch {
            when (val result = authRepository.requestOtp(phone)) {
                is AppResult.Success -> {
                    savedStateHandle[KEY_STEP] = PhoneStep.CODE.name
                    _uiState.update { it.copy(isSubmitting = false, step = PhoneStep.CODE, code = "", codeError = null) }
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
            PhoneSignInUiState(phone = it.phone, pendingChallengeId = challengeId)
        }
    }

    private fun setActive(active: Boolean) {
        savedStateHandle[KEY_ACTIVE] = active
        _uiState.update { it.copy(active = active, failure = null, phoneError = null, codeError = null) }
    }

    private fun toPhoneStep() {
        countdown?.cancel()
        savedStateHandle.remove<String>(KEY_STEP)
        _uiState.update {
            it.copy(step = PhoneStep.PHONE, code = "", codeError = null, failure = null, resendInSeconds = 0)
        }
    }

    private fun restoredState(): PhoneSignInUiState {
        val step = PhoneStep.entries.firstOrNull { it.name == savedStateHandle.get<String>(KEY_STEP) } ?: PhoneStep.PHONE
        return PhoneSignInUiState(
            active = savedStateHandle.get<Boolean>(KEY_ACTIVE) == true,
            step = step,
            phone = savedStateHandle.get<String>(KEY_PHONE).orEmpty(),
        )
    }

    private companion object {
        const val KEY_ACTIVE = "phoneSignInActive"
        const val KEY_PHONE = "phoneSignInPhone"
        const val KEY_STEP = "phoneSignInStep"
        const val TICK_MILLIS = 1_000L
    }
}
