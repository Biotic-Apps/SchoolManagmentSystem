package com.schoolapp.feature.fees.parent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.FeesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent: the active child's fee summary and invoices; reloads when the parent switches child. */
@HiltViewModel
class ParentFeesViewModel @Inject constructor(
    authRepository: AuthRepository,
    private val repository: FeesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentFeesUiState())
    val uiState: StateFlow<ParentFeesUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild }
                .distinctUntilChanged()
                .collectLatest { child ->
                    loadJob?.cancel()
                    _uiState.update {
                        ParentFeesUiState(isLoading = child != null, childId = child?.id, childName = child?.fullName)
                    }
                    load()
                }
        }
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        relaunch()
    }

    fun refresh() {
        if (_uiState.value.childId == null) return
        _uiState.update { it.copy(isRefreshing = true) }
        relaunch()
    }

    private fun relaunch() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch { load() }
    }

    private suspend fun load() {
        val childId = _uiState.value.childId ?: return
        val (summary, invoices) = coroutineScope {
            val summary = async { repository.feeSummary(childId) }
            val invoices = async { repository.invoices(studentId = childId) }
            summary.await() to invoices.await()
        }
        _uiState.update { current ->
            if (current.childId != childId) return@update current
            val error = (summary as? AppResult.Failure)?.error ?: (invoices as? AppResult.Failure)?.error
            current.copy(
                isLoading = false,
                isRefreshing = false,
                error = error,
                summary = (summary as? AppResult.Success)?.data ?: current.summary,
                invoices = (invoices as? AppResult.Success)?.data ?: current.invoices,
            )
        }
    }
}
