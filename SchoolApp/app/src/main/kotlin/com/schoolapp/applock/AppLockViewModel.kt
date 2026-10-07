package com.schoolapp.applock

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.data.applock.AppLockAvailability
import com.schoolapp.core.data.applock.AppLockController
import com.schoolapp.core.data.applock.AppLockRepository
import com.schoolapp.core.data.applock.AppLockState
import com.schoolapp.core.ui.unlock.UnlockResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

/** Lock overlay: unlock after a successful prompt; sign-out is handled by the app (always available). */
@OptIn(ExperimentalCoroutinesApi::class)
@HiltViewModel
class AppLockViewModel @Inject constructor(
    private val controller: AppLockController,
    private val appLockRepository: AppLockRepository,
) : ViewModel() {

    private val error = MutableStateFlow<String?>(null)

    private val canUnlock = controller.state.flatMapLatest { state ->
        if (state == AppLockState.LOCKED) {
            flow<Boolean?> {
                emit(null)
                emit(appLockRepository.availability() == AppLockAvailability.AVAILABLE)
            }
        } else {
            flowOf<Boolean?>(null)
        }
    }

    val uiState: StateFlow<AppLockUiState> = combine(controller.state, canUnlock, error) { lock, canUnlock, error ->
        AppLockUiState(lock = lock, canUnlock = canUnlock, error = error.takeIf { lock == AppLockState.LOCKED })
    }.stateIn(viewModelScope, SharingStarted.Eagerly, AppLockUiState(lock = controller.state.value))

    fun onUnlockResult(result: UnlockResult) {
        when (result) {
            UnlockResult.Success -> {
                error.value = null
                controller.unlock()
            }
            UnlockResult.Cancelled -> error.value = null
            is UnlockResult.Error -> error.value = result.message.takeIf { it.isNotBlank() }
        }
    }
}
