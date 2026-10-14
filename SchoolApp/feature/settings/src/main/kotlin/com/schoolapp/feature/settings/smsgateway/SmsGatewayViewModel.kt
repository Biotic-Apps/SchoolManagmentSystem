package com.schoolapp.feature.settings.smsgateway

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.SettingsRepository
import com.schoolapp.core.model.settings.SmsGatewayStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
internal data class SmsGatewayUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val status: SmsGatewayStatus? = null,
    val gatewayUrl: String = "",
)

/** Status of the school's Android phone SMS relay (scoped by the caller's school on the server). */
@HiltViewModel
internal class SmsGatewayViewModel @Inject constructor(
    private val repository: SettingsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SmsGatewayUiState(gatewayUrl = repository.smsGatewayUrl))
    val uiState: StateFlow<SmsGatewayUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    /** Background poll: keeps what is shown when a poll fails. */
    fun poll() {
        if (loadJob?.isActive == true) return
        loadJob = viewModelScope.launch {
            val result = repository.smsGatewayStatus()
            if (result is AppResult.Success) _uiState.update { it.copy(status = result.data, error = null) }
        }
    }

    private fun load(refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing && it.status == null, isRefreshing = refreshing, error = null) }
            val result = repository.smsGatewayStatus()
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false)
                when (result) {
                    is AppResult.Success -> base.copy(status = result.data)
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }
}
