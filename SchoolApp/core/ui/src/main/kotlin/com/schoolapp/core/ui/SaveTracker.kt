package com.schoolapp.core.ui

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.designsystem.component.SaveStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * One "All changes saved" indicator for every autosave of a screen: SAVING while any save runs, FAILED when
 * the last finished save failed (until the next one succeeds), SAVED otherwise.
 */
class SaveTracker {
    private val running = MutableStateFlow(0)
    private val _status = MutableStateFlow(SaveStatus.IDLE)
    val status: StateFlow<SaveStatus> = _status.asStateFlow()

    suspend fun <T> track(block: suspend () -> AppResult<T>): AppResult<T> {
        running.update { it + 1 }
        _status.value = SaveStatus.SAVING
        val result = try {
            block()
        } finally {
            running.update { it - 1 }
        }
        _status.value = when {
            running.value > 0 -> SaveStatus.SAVING
            result is AppResult.Failure -> SaveStatus.FAILED
            else -> SaveStatus.SAVED
        }
        return result
    }
}
