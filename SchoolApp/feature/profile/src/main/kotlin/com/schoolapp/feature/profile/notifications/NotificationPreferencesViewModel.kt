package com.schoolapp.feature.profile.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notifications.NotificationPreferencesRepository
import com.schoolapp.core.model.notification.NotificationPreference
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import javax.inject.Inject

/** Push on/off per category, saved on each toggle and rolled back if the save fails. */
@HiltViewModel
class NotificationPreferencesViewModel @Inject constructor(
    private val repository: NotificationPreferencesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationPreferencesUiState())
    val uiState: StateFlow<NotificationPreferencesUiState> = _uiState.asStateFlow()

    private val saveLock = Mutex()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            when (val result = repository.preferences()) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, items = normalized(result.data)) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    /** Critical categories (health, pickup) ignore the toggle: they always push. */
    fun onPushChange(category: String, enabled: Boolean) {
        val current = _uiState.value.items.firstOrNull { it.category == category } ?: return
        if (current.isCritical || current.push == enabled) return
        _uiState.update { state ->
            state.copy(items = state.items.withPush(category, enabled), saving = state.saving + category, saveError = null)
        }
        viewModelScope.launch {
            val result = saveLock.withLock { repository.update(_uiState.value.items) }
            _uiState.update { state ->
                val saving = state.saving - category
                when (result) {
                    is AppResult.Success -> state.copy(
                        saving = saving,
                        items = if (saving.isEmpty()) normalized(result.data).ifEmpty { state.items } else state.items,
                    )
                    is AppResult.Failure -> state.copy(
                        saving = saving,
                        items = state.items.withPush(category, !enabled),
                        saveError = result.error,
                    )
                }
            }
        }
    }

    private fun List<NotificationPreference>.withPush(category: String, push: Boolean) =
        map { if (it.category == category) it.copy(push = push) else it }

    private companion object {
        val ORDER = listOf(
            "ATTENDANCE", "DIARY", "ACTIVITY", "CONSENT", "NOTICE", "MESSAGE",
            "COMPLAINT", "MEETING", "HEALTH", "PICKUP", "LEAVE", "APPROVAL",
        )

        /** Known order (unknown categories last); in-app is always on and critical ones always push. */
        fun normalized(items: List<NotificationPreference>): List<NotificationPreference> = items
            .sortedBy { item -> ORDER.indexOf(item.category).let { if (it < 0) Int.MAX_VALUE else it } }
            .map { it.copy(inApp = true, push = it.push || it.isCritical) }
    }
}
