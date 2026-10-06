package com.schoolapp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.auth.AuthState
import com.schoolapp.core.data.push.DeviceRegistrar
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AppViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val deviceRegistrar: DeviceRegistrar,
) : ViewModel() {

    val uiState: StateFlow<AppUiState> = authRepository.authState
        .map {
            when (it) {
                AuthState.SignedOut -> AppUiState.SignedOut
                AuthState.PasswordChangeRequired -> AppUiState.PasswordChangeRequired
                is AuthState.SignedIn -> AppUiState.SignedIn
            }
        }
        .distinctUntilChanged()
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppUiState.Loading)

    private var refreshJob: Job? = null

    init {
        // Push token registration (no-op until a Firebase token provider is bound).
        viewModelScope.launch {
            uiState.filter { it == AppUiState.SignedIn }.collect { deviceRegistrar.registerIfAvailable() }
        }
    }

    /** App start/resume: re-reads `/me` so role, permission and account changes apply immediately. */
    fun onForeground() {
        if (refreshJob?.isActive == true) return
        refreshJob = viewModelScope.launch {
            if (authRepository.authState.first() != AuthState.SignedOut) authRepository.refreshSession()
        }
    }

    fun onSignOut() {
        viewModelScope.launch { authRepository.logout() }
    }
}
