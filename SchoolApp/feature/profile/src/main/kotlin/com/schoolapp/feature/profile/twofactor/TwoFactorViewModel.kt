package com.schoolapp.feature.profile.twofactor

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.profile.twofactor.TwoFactorRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TwoFactorViewModel @Inject constructor(
    private val repository: TwoFactorRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TwoFactorUiState())
    val uiState: StateFlow<TwoFactorUiState> = _uiState.asStateFlow()

    private val dialogs = TwoFactorDialogController(repository, viewModelScope, _uiState)

    init {
        viewModelScope.launch {
            val user = authRepository.session.firstOrNull()?.user
            _uiState.update { it.copy(account = user?.email ?: user?.phone ?: user?.fullName.orEmpty()) }
        }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            when (val result = repository.status()) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, enabled = result.data.enabled, required = result.data.required)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    fun onStartSetup() {
        if (_uiState.value.isStarting) return
        _uiState.update { it.copy(isStarting = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.startSetup()) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isStarting = false, setup = result.data, code = "", codeError = null)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isStarting = false, actionError = result.error) }
            }
        }
    }

    fun onCancelSetup() = _uiState.update { it.copy(setup = null, code = "", codeError = null, actionError = null) }

    fun onCodeChange(value: String) = _uiState.update {
        it.copy(code = value.filter(Char::isDigit).take(CODE_LENGTH), codeError = null, actionError = null)
    }

    fun onEnable() {
        val s = _uiState.value
        if (s.isEnabling || s.setup == null) return
        val error = TwoFactorCodeRules.totp(s.code)
        if (error != null) {
            _uiState.update { it.copy(codeError = error) }
            return
        }
        _uiState.update { it.copy(isEnabling = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.enable(TwoFactorCodeRules.normalize(s.code))) {
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        isEnabling = false, enabled = true, setup = null, code = "",
                        recoveryCodes = result.data, notice = TwoFactorNotice.ENABLED,
                    )
                }
                is AppResult.Failure -> _uiState.update {
                    if (TwoFactorCodeRules.isWrongCode(result.error)) {
                        it.copy(isEnabling = false, codeError = CodeFieldError.WRONG)
                    } else {
                        it.copy(isEnabling = false, actionError = result.error)
                    }
                }
            }
        }
    }

    fun onRecoveryCodesSaved() = _uiState.update { it.copy(recoveryCodes = null) }

    fun onNoticeShown() = _uiState.update { it.copy(notice = null) }

    fun openDialog(kind: TwoFactorDialogKind) = dialogs.open(kind)

    fun closeDialog() = dialogs.close()

    fun onDialogPasswordChange(value: String) = dialogs.onPasswordChange(value)

    fun onDialogCodeChange(value: String) = dialogs.onCodeChange(value)

    fun onDialogSubmit() = dialogs.submit()

    fun onDialogConfirm() = dialogs.confirm()

    fun onDialogConfirmDismiss() = dialogs.dismissConfirm()

    private companion object {
        const val CODE_LENGTH = 6
    }
}
