package com.schoolapp.feature.fees.staff.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.FeesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Accountant/principal: finance overview tiles and today's collection for the active branch. */
@HiltViewModel
class TodayViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: FeesRepository,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TodayUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<TodayUiState> = _uiState.asStateFlow()

    private var branchId: String? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            branchId = session.activeBranchId
            _uiState.update { it.copy(canRecord = session.has(FEES_ADD)) }
            load()
        }
        viewModelScope.launch { repository.queuedPayments.collect { count -> _uiState.update { it.copy(queuedPayments = count) } } }
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch { load() }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        viewModelScope.launch { load() }
    }

    private suspend fun load() {
        val date = _uiState.value.today
        val (overview, collection) = coroutineScope {
            val overview = async { repository.financeOverview(branchId) }
            val collection = async { repository.dailyCollection(date, branchId) }
            overview.await() to collection.await()
        }
        _uiState.update {
            it.copy(
                isLoading = false,
                isRefreshing = false,
                error = (overview as? AppResult.Failure)?.error ?: (collection as? AppResult.Failure)?.error,
                overview = (overview as? AppResult.Success)?.data ?: it.overview,
                collection = (collection as? AppResult.Success)?.data ?: it.collection,
            )
        }
    }

    private companion object {
        const val FEES_ADD = "fees.add"
    }
}
