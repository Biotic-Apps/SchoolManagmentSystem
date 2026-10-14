package com.schoolapp.feature.settings.backups

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.BackupsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Backups list (super admin); polls every 5 s while a backup or restore check is running. */
@HiltViewModel
internal class BackupsViewModel @Inject constructor(
    private val repository: BackupsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(BackupsUiState())
    val uiState: StateFlow<BackupsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var pollJob: Job? = null

    init {
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun askRun() = _uiState.update { it.copy(confirmRun = true) }

    fun dismissRun() = _uiState.update { it.copy(confirmRun = false) }

    fun showChecks(id: String?) = _uiState.update { it.copy(checksRunId = id) }

    fun dismissMessage() = _uiState.update { it.copy(message = null, actionError = null) }

    fun downloadOpened() = _uiState.update { it.copy(downloadUrl = null) }

    fun runBackup() {
        if (_uiState.value.starting) return
        _uiState.update { it.copy(starting = true, actionError = null, message = null) }
        viewModelScope.launch {
            val result = repository.runBackup()
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(starting = false, confirmRun = false, message = BackupMessage.BACKUP_STARTED)
                    is AppResult.Failure -> state.copy(starting = false, confirmRun = false, actionError = result.error)
                }
            }
            if (result is AppResult.Success) load(refreshing = true)
        }
    }

    fun verify(id: String) {
        if (_uiState.value.verifyingId != null) return
        _uiState.update { it.copy(verifyingId = id, actionError = null, message = null) }
        viewModelScope.launch {
            val result = repository.verify(id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(verifyingId = null, message = BackupMessage.VERIFY_STARTED)
                    is AppResult.Failure -> state.copy(verifyingId = null, actionError = result.error)
                }
            }
            if (result is AppResult.Success) load(refreshing = true)
        }
    }

    fun download(id: String) {
        if (_uiState.value.downloadingId != null) return
        _uiState.update { it.copy(downloadingId = id, actionError = null) }
        viewModelScope.launch {
            val result = repository.downloadUrl(id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(downloadingId = null, downloadUrl = result.data)
                    is AppResult.Failure -> state.copy(downloadingId = null, actionError = result.error)
                }
            }
        }
    }

    private fun load(refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing && it.runs.isEmpty(), isRefreshing = refreshing, error = null) }
            val result = repository.backups()
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> base.copy(runs = result.data)
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
            schedulePoll()
        }
    }

    /** Keeps the list fresh while something runs; stops once everything settled. */
    private fun schedulePoll() {
        pollJob?.cancel()
        if (_uiState.value.runs.none { it.isBusy }) return
        pollJob = viewModelScope.launch {
            delay(POLL_MS)
            if (isActive) load(refreshing = false)
        }
    }

    private companion object {
        const val POLL_MS = 5_000L
    }
}
