package com.schoolapp.feature.profile.applock

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.data.applock.AppLockAvailability
import com.schoolapp.core.data.applock.AppLockRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.ui.unlock.UnlockResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Profile › Security › App lock. Turning it on is confirmed with the system prompt first (in the UI). */
@HiltViewModel
class AppLockSettingsViewModel @Inject constructor(
    private val appLockRepository: AppLockRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val availability = MutableStateFlow<AppLockAvailability?>(null)
    private val pending = MutableStateFlow(Pending())

    val uiState: StateFlow<AppLockSettingsUiState> = combine(
        appLockRepository.enabled,
        authRepository.session,
        availability,
        pending,
    ) { enabled, session, availability, pending ->
        AppLockSettingsUiState(
            enabled = enabled,
            availability = availability,
            recommended = session != null && session.activeRole != RoleKey.PARENT,
            isSaving = pending.isSaving,
            promptError = pending.promptError,
        )
    }.stateIn(viewModelScope, SharingStarted.Eagerly, AppLockSettingsUiState())

    init {
        refreshAvailability()
    }

    /** Re-checked on every resume: the user may have just set up a screen lock in Settings. */
    fun refreshAvailability() {
        viewModelScope.launch { availability.value = appLockRepository.availability() }
    }

    fun onEnableResult(result: UnlockResult) {
        when (result) {
            UnlockResult.Success -> save(true)
            UnlockResult.Cancelled -> pending.update { it.copy(promptError = null) }
            is UnlockResult.Error -> pending.update { it.copy(promptError = result.message.takeIf(String::isNotBlank)) }
        }
    }

    fun onDisable() = save(false)

    private fun save(enabled: Boolean) {
        if (pending.value.isSaving) return
        pending.value = Pending(isSaving = true)
        viewModelScope.launch {
            val saved = appLockRepository.setEnabled(enabled)
            if (!saved) availability.value = appLockRepository.availability()
            pending.value = Pending()
        }
    }

    private data class Pending(val isSaving: Boolean = false, val promptError: String? = null)
}
