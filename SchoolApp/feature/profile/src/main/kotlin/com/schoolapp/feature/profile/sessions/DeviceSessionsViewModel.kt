package com.schoolapp.feature.profile.sessions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.profile.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DeviceSessionsViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(DeviceSessionsUiState())
    val uiState: StateFlow<DeviceSessionsUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            when (val result = profileRepository.deviceSessions()) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, sessions = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    fun onRevoke(id: String) {
        if (_uiState.value.revokingId != null) return
        _uiState.update { it.copy(revokingId = id, actionError = null) }
        viewModelScope.launch {
            when (val result = profileRepository.revokeSession(id)) {
                is AppResult.Success -> _uiState.update { s ->
                    s.copy(revokingId = null, sessions = s.sessions.filterNot { it.id == id })
                }
                is AppResult.Failure -> _uiState.update { it.copy(revokingId = null, actionError = result.error) }
            }
        }
    }

    /** Success ends this session too; the auth state then returns the app to login. */
    fun onLogoutAll() {
        if (_uiState.value.isLoggingOutAll) return
        _uiState.update { it.copy(isLoggingOutAll = true, actionError = null) }
        viewModelScope.launch {
            val result = authRepository.logoutAll()
            if (result is AppResult.Failure) _uiState.update { it.copy(isLoggingOutAll = false, actionError = result.error) }
        }
    }
}
