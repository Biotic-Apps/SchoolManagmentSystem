package com.schoolapp.feature.profile.twofactor

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.profile.twofactor.TwoFactorRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** The "Regenerate recovery codes" and "Turn off" sheets: validation, confirm step and API calls. */
internal class TwoFactorDialogController(
    private val repository: TwoFactorRepository,
    private val scope: CoroutineScope,
    private val state: MutableStateFlow<TwoFactorUiState>,
) {
    fun open(kind: TwoFactorDialogKind) = state.update { it.copy(dialog = TwoFactorDialogState(kind)) }

    fun close() = state.update { if (it.dialog?.isSubmitting == true) it else it.copy(dialog = null) }

    fun onPasswordChange(value: String) = edit { it.copy(password = value, passwordMissing = false) }

    fun onCodeChange(value: String) = edit {
        val code = if (it.kind == TwoFactorDialogKind.REGENERATE) value.filter(Char::isDigit).take(TOTP_LENGTH) else value
        it.copy(code = code, codeError = null)
    }

    /** Validates; turning off asks for confirmation first, regenerating calls the API straight away. */
    fun submit() {
        val d = state.value.dialog ?: return
        if (d.isSubmitting) return
        val isDisable = d.kind == TwoFactorDialogKind.DISABLE
        val codeError = if (isDisable) TwoFactorCodeRules.any(d.code) else TwoFactorCodeRules.totp(d.code)
        val passwordMissing = isDisable && d.password.isEmpty()
        when {
            codeError != null || passwordMissing -> update { it.copy(codeError = codeError, passwordMissing = passwordMissing) }
            isDisable -> update { it.copy(confirming = true) }
            else -> regenerate(d)
        }
    }

    fun confirm() {
        val d = state.value.dialog ?: return
        update { it.copy(confirming = false) }
        disable(d)
    }

    fun dismissConfirm() = update { it.copy(confirming = false) }

    private fun regenerate(d: TwoFactorDialogState) {
        update { it.copy(isSubmitting = true, failure = null) }
        scope.launch {
            when (val result = repository.regenerateRecoveryCodes(TwoFactorCodeRules.normalize(d.code))) {
                is AppResult.Success -> state.update {
                    it.copy(dialog = null, recoveryCodes = result.data, notice = TwoFactorNotice.REGENERATED)
                }
                is AppResult.Failure -> update {
                    if (TwoFactorCodeRules.isWrongCode(result.error)) {
                        it.copy(isSubmitting = false, codeError = CodeFieldError.WRONG)
                    } else {
                        it.copy(isSubmitting = false, failure = result.error)
                    }
                }
            }
        }
    }

    private fun disable(d: TwoFactorDialogState) {
        update { it.copy(isSubmitting = true, failure = null, wrongCredentials = false) }
        scope.launch {
            when (val result = repository.disable(d.password, TwoFactorCodeRules.normalize(d.code))) {
                is AppResult.Success -> state.update {
                    it.copy(dialog = null, enabled = false, recoveryCodes = null, notice = TwoFactorNotice.DISABLED)
                }
                is AppResult.Failure -> update {
                    if (TwoFactorCodeRules.isWrongCode(result.error)) {
                        it.copy(isSubmitting = false, wrongCredentials = true)
                    } else {
                        it.copy(isSubmitting = false, failure = result.error)
                    }
                }
            }
        }
    }

    private fun edit(transform: (TwoFactorDialogState) -> TwoFactorDialogState) =
        update { transform(it).copy(failure = null, wrongCredentials = false) }

    private fun update(transform: (TwoFactorDialogState) -> TwoFactorDialogState) =
        state.update { s -> s.dialog?.let { s.copy(dialog = transform(it)) } ?: s }

    private companion object {
        const val TOTP_LENGTH = 6
    }
}
