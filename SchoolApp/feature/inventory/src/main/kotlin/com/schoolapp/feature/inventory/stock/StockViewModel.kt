package com.schoolapp.feature.inventory.stock

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.inventory.InventoryRepository
import com.schoolapp.core.model.inventory.StockLine
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class StockUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val lines: List<StockLine> = emptyList(),
    val lowOnly: Boolean = false,
) {
    val lowCount: Int get() = lines.count { it.low }
    val shown: List<StockLine> get() = if (lowOnly) lines.filter { it.low } else lines
}

/** Current stock of the branch with low-stock flags (web "Stock" tab). */
@HiltViewModel
class StockViewModel @Inject constructor(
    private val repository: InventoryRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StockUiState())
    val uiState: StateFlow<StockUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var version = -1
    private var job: Job? = null

    fun bind(branchId: String, version: Int) {
        if (branchId == this.branchId && version == this.version) return
        val branchChanged = branchId != this.branchId
        this.branchId = branchId
        this.version = version
        if (branchChanged) _uiState.update { StockUiState(lowOnly = it.lowOnly) }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        load()
    }

    fun onLowOnlyChange(lowOnly: Boolean) = _uiState.update { it.copy(lowOnly = lowOnly) }

    private fun load() {
        val branch = branchId ?: return
        job?.cancel()
        job = viewModelScope.launch {
            when (val result = repository.stock(branch)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, isRefreshing = false, error = null, lines = result.data)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            }
        }
    }
}
