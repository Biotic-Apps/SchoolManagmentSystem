package com.schoolapp.feature.settings.support

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.SupportRepository
import com.schoolapp.core.model.settings.SystemHealth
import com.schoolapp.core.model.settings.TestMessageResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

internal enum class TestChannel { EMAIL, SMS }

internal enum class TestProblem { REQUIRED, BAD_EMAIL, BAD_PHONE }

@Immutable
internal data class SupportHealthUiState(
    val healthLoading: Boolean = true,
    val healthError: AppError? = null,
    val health: SystemHealth? = null,
    val channel: TestChannel = TestChannel.EMAIL,
    val to: String = "",
    val toProblem: TestProblem? = null,
    val sending: Boolean = false,
    val result: TestMessageResult? = null,
    val sendError: AppError? = null,
)

/** System health tiles and the "Send test message" form (super admin). */
@HiltViewModel
internal class SupportHealthViewModel @Inject constructor(
    private val repository: SupportRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SupportHealthUiState())
    val uiState: StateFlow<SupportHealthUiState> = _uiState.asStateFlow()

    private var healthJob: Job? = null

    init {
        loadHealth()
    }

    fun loadHealth() {
        healthJob?.cancel()
        healthJob = viewModelScope.launch {
            _uiState.update { it.copy(healthLoading = true, healthError = null) }
            val result = repository.health()
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(healthLoading = false, health = result.data)
                    is AppResult.Failure -> state.copy(healthLoading = false, healthError = result.error)
                }
            }
        }
    }

    fun setChannel(channel: TestChannel) = _uiState.update { it.copy(channel = channel, to = "", toProblem = null, result = null, sendError = null) }

    fun setTo(value: String) = _uiState.update { it.copy(to = value, toProblem = null, result = null, sendError = null) }

    fun send() {
        val state = _uiState.value
        if (state.sending) return
        val to = state.to.trim()
        val problem = when {
            to.isEmpty() -> TestProblem.REQUIRED
            state.channel == TestChannel.EMAIL && !EMAIL.matches(to) -> TestProblem.BAD_EMAIL
            state.channel == TestChannel.SMS && !PHONE.matches(to) -> TestProblem.BAD_PHONE
            else -> null
        }
        if (problem != null) {
            _uiState.update { it.copy(toProblem = problem) }
            return
        }
        _uiState.update { it.copy(sending = true, result = null, sendError = null) }
        viewModelScope.launch {
            val result = repository.sendTestMessage(state.channel.name, to)
            _uiState.update { now ->
                when (result) {
                    is AppResult.Success -> now.copy(sending = false, result = result.data)
                    is AppResult.Failure -> now.copy(sending = false, sendError = result.error)
                }
            }
        }
    }

    private companion object {
        val EMAIL = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
        val PHONE = Regex("^\\+?[\\d\\s()-]{7,20}$")
    }
}
