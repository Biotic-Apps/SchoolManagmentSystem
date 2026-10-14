package com.schoolapp.feature.attendance.qr

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.attendance.QrScanRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.attendance.QrScanDirection
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** ID-card QR attendance: sends each scanned card with the chosen direction and keeps today's log fresh. */
@HiltViewModel
class QrScanViewModel @Inject constructor(
    authRepository: AuthRepository,
    private val repository: QrScanRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(QrScanUiState())
    val uiState: StateFlow<QrScanUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.has(ADD) }
                .distinctUntilChanged()
                .collect { allowed -> _uiState.update { it.copy(canScan = allowed) } }
        }
    }

    fun onDirection(direction: QrScanDirection) = _uiState.update { it.copy(direction = direction) }

    fun onScannerFailed() = _uiState.update { it.copy(problem = QrScanProblem.SCANNER_UNAVAILABLE, isProcessing = false) }

    fun onScanned(raw: String?) {
        val code = raw?.trim().orEmpty()
        if (_uiState.value.isProcessing) return
        if (!UUID.matches(code)) {
            _uiState.update { it.copy(problem = QrScanProblem.INVALID_CODE, error = null, lastResult = null) }
            return
        }
        _uiState.update { it.copy(isProcessing = true, problem = null, error = null) }
        viewModelScope.launch {
            when (val result = repository.scan(code, _uiState.value.direction)) {
                is AppResult.Success -> _uiState.update { it.copy(isProcessing = false, lastResult = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isProcessing = false, error = result.error, lastResult = null) }
            }
            refreshLogs()
        }
    }

    fun refreshLogs() {
        viewModelScope.launch {
            val result = repository.logs()
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(logs = result.data, logsLoading = false)
                    is AppResult.Failure -> state.copy(logsLoading = false)
                }
            }
        }
    }

    fun reset() = _uiState.update { it.copy(lastResult = null, problem = null, error = null) }

    private companion object {
        const val ADD = "attendance.add"
        val UUID = Regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
    }
}
