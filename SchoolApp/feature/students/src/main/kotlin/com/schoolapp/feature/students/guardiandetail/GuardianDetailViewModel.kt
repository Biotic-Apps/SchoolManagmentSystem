package com.schoolapp.feature.students.guardiandetail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.guardians.GuardianAdminRepository
import com.schoolapp.core.model.admissions.ParentLogin
import com.schoolapp.core.model.guardians.ParentCredentials
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * A guardian (web GuardianDetailDrawer): details, parent sign-in (give access, new password, send steps) and
 * linked children (open, unlink). Editing and unlinking live in [GuardianSheets].
 */
@HiltViewModel
class GuardianDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: GuardianAdminRepository,
    authRepository: AuthRepository,
    val sheets: GuardianSheets,
) : ViewModel() {

    private val guardianId: String = checkNotNull(savedStateHandle["id"]) { "Guardian id missing" }
    private val _uiState = MutableStateFlow(GuardianDetailUiState())
    val uiState: StateFlow<GuardianDetailUiState> = _uiState.asStateFlow()

    init {
        sheets.bind(guardianId, _uiState, viewModelScope, ::reload)
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canEdit = session.has("guardians.edit")
            _uiState.update { it.copy(canEdit = canEdit, canReset = canEdit && session.has("users.edit")) }
        }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        reload()
    }

    private fun reload() {
        viewModelScope.launch {
            when (val result = repository.detail(guardianId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, error = null, detail = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun askSignIn(action: SignInAction) = _uiState.update { it.copy(confirm = action, actionError = null) }

    fun dismissConfirm() = _uiState.update { if (it.confirming) it else it.copy(confirm = null) }

    fun confirmSignIn() {
        val action = _uiState.value.confirm ?: return
        if (_uiState.value.confirming) return
        _uiState.update { it.copy(confirming = true, actionError = null) }
        viewModelScope.launch {
            val result = when (action) {
                SignInAction.CREATE -> repository.createAccount(guardianId)
                SignInAction.RESET -> repository.resetPassword(guardianId)
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(confirming = false, confirm = null, revealed = reveal(action, result.data)) }
                    reload()
                }
                is AppResult.Failure -> _uiState.update { it.copy(confirming = false, confirm = null, actionError = result.error.toActionError()) }
            }
        }
    }

    fun sendSignIn() {
        if (_uiState.value.sending) return
        _uiState.update { it.copy(sending = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.sendSignIn(guardianId)) {
                is AppResult.Success -> _uiState.update { it.copy(sending = false, notice = GuardianNotice.Sent(result.data)) }
                is AppResult.Failure -> _uiState.update { it.copy(sending = false, actionError = result.error.toActionError()) }
            }
        }
    }

    fun dismissRevealed() = _uiState.update { it.copy(revealed = null) }

    fun dismissError() = _uiState.update { it.copy(actionError = null) }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    private fun reveal(action: SignInAction, credentials: ParentCredentials): RevealedLogin {
        val state = _uiState.value
        val guardian = state.detail?.guardian
        val login = state.detail?.login
        return RevealedLogin(
            title = action,
            login = ParentLogin(
                guardianName = guardian?.name.orEmpty(),
                status = if (credentials.temporaryPassword != null) "CREATED" else "EXISTING",
                email = credentials.userEmail ?: login?.email ?: guardian?.email,
                phone = credentials.userPhone ?: login?.phone ?: guardian?.phone,
                temporaryPassword = credentials.temporaryPassword,
                reason = null,
            ),
            admissionNo = state.usernameChild?.admissionNo,
        )
    }
}
