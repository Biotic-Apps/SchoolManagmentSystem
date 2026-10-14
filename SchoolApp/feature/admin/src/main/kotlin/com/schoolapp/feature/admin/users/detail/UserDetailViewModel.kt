package com.schoolapp.feature.admin.users.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.users.UsersRepository
import com.schoolapp.core.model.users.AdminUserDetail
import com.schoolapp.feature.admin.common.AdminNotice
import com.schoolapp.feature.admin.common.AdminNotices
import com.schoolapp.feature.admin.users.UserPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One account: details, active roles, and disable / enable, unlock, reset password, end assignment. */
@HiltViewModel
class UserDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: UsersRepository,
    authRepository: AuthRepository,
    private val notices: AdminNotices,
) : ViewModel() {

    private val userId: String = checkNotNull(savedStateHandle["userId"])
    private val _uiState = MutableStateFlow(UserDetailUiState())
    val uiState: StateFlow<UserDetailUiState> = _uiState.asStateFlow()
    val notice: StateFlow<AdminNotice?> = notices.notice
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.map(UserPermissions::of).distinctUntilChanged().collect { permissions ->
                _uiState.update { it.copy(permissions = permissions) }
            }
        }
        viewModelScope.launch { repository.changes.drop(1).collect { load(quiet = true) } }
        load(quiet = false)
    }

    fun retry() = load(quiet = false)

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load(quiet = true)
    }

    fun consumeNotice(notice: AdminNotice) = notices.consume(notice)

    fun ask(confirm: UserConfirm) = _uiState.update { it.copy(confirm = confirm, actionError = null) }

    fun dismissConfirm() = _uiState.update { it.copy(confirm = null) }

    fun dismissPassword() = _uiState.update { it.copy(revealedPassword = null) }

    fun confirm() {
        val state = _uiState.value
        val confirm = state.confirm ?: return
        val user = state.detail?.user ?: return
        if (state.isWorking) return
        _uiState.update { it.copy(confirm = null, isWorking = true, actionError = null) }
        viewModelScope.launch {
            when (confirm) {
                UserConfirm.ResetPassword -> when (val result = repository.resetPassword(user.id)) {
                    is AppResult.Success -> _uiState.update { it.copy(isWorking = false, revealedPassword = result.data) }
                    is AppResult.Failure -> _uiState.update { it.copy(isWorking = false, actionError = result.error) }
                }
                UserConfirm.ToggleStatus -> run(
                    if (user.isActive) repository.disable(user.id) else repository.enable(user.id),
                    if (user.isActive) AdminNotice.Kind.USER_DISABLED else AdminNotice.Kind.USER_ENABLED,
                )
                UserConfirm.Unlock -> run(repository.unlock(user.id), AdminNotice.Kind.USER_UNLOCKED)
                is UserConfirm.EndAssignment ->
                    run(repository.endAssignment(user.id, confirm.assignment.id), AdminNotice.Kind.ASSIGNMENT_ENDED)
            }
        }
    }

    private fun run(result: AppResult<AdminUserDetail>, notice: AdminNotice.Kind) {
        when (result) {
            is AppResult.Success -> {
                _uiState.update { it.copy(isWorking = false, detail = result.data) }
                notices.post(AdminNotice(notice, result.data.user.name))
            }
            is AppResult.Failure -> _uiState.update { it.copy(isWorking = false, actionError = result.error) }
        }
    }

    private fun load(quiet: Boolean) {
        loadJob?.cancel()
        if (!quiet) _uiState.update { it.copy(isLoading = it.detail == null, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.user(userId)
            _uiState.update {
                val base = it.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> base.copy(detail = result.data, error = null)
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }
}
