package com.schoolapp.feature.settings.imports

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.ImportsRepository
import com.schoolapp.core.model.settings.ImportSummary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
internal data class ImportHistoryUiState(
    val isLoading: Boolean = false,
    val error: AppError? = null,
    val rows: List<ImportSummary>? = null,
    val revertTarget: ImportSummary? = null,
    val reverting: Boolean = false,
    val reverted: Boolean = false,
    val revertError: AppError? = null,
)

/** Imports of the chosen branch, newest first, with revert for committed ones. */
@HiltViewModel
internal class ImportHistoryViewModel @Inject constructor(
    private val repository: ImportsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ImportHistoryUiState())
    val uiState: StateFlow<ImportHistoryUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    fun load(branch: String) {
        if (branch != branchId) _uiState.update { it.copy(rows = null) }
        branchId = branch
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = repository.history(branch)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, rows = result.data.sortedByDescending { it.startedAt.orEmpty() })
                    is AppResult.Failure -> state.copy(isLoading = false, error = result.error)
                }
            }
        }
    }

    fun retry() = branchId?.let(::load)

    fun askRevert(item: ImportSummary?) = _uiState.update { it.copy(revertTarget = item, reverted = false, revertError = null) }

    fun confirmRevert() {
        val target = _uiState.value.revertTarget ?: return
        if (_uiState.value.reverting) return
        _uiState.update { it.copy(reverting = true) }
        viewModelScope.launch {
            val result = repository.revert(target.id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(reverting = false, revertTarget = null, reverted = true)
                    is AppResult.Failure -> state.copy(reverting = false, revertTarget = null, revertError = result.error)
                }
            }
            if (result is AppResult.Success) retry()
        }
    }
}
