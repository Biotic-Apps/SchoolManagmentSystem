package com.schoolapp.feature.settings.support

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.SupportRepository
import com.schoolapp.core.model.settings.FailedNotification
import com.schoolapp.core.model.settings.FailedNotificationFilters
import com.schoolapp.core.model.settings.PagedList
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

internal enum class SupportMessage { RESENT, RESENT_ALL, JOB_RETRIED }

@Immutable
internal data class FailedNotificationsUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val filters: FailedNotificationFilters = FailedNotificationFilters(),
    val page: Int = 1,
    val result: PagedList<FailedNotification>? = null,
    val resendingId: String? = null,
    val confirmAll: Boolean = false,
    val resendingAll: Boolean = false,
    val message: SupportMessage? = null,
    val actionError: AppError? = null,
) {
    val total: Int get() = result?.total ?: 0
}

/** Failed email / SMS / push deliveries of the school, with resend and resend-all. */
@HiltViewModel
internal class FailedNotificationsViewModel @Inject constructor(
    private val repository: SupportRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(FailedNotificationsUiState())
    val uiState: StateFlow<FailedNotificationsUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null

    fun bind(id: String) {
        if (schoolId == id) return
        schoolId = id
        load()
    }

    fun reload() = load()

    fun setFilters(filters: FailedNotificationFilters) {
        _uiState.update { it.copy(filters = filters, page = 1) }
        load()
    }

    fun setPage(page: Int) {
        _uiState.update { it.copy(page = page) }
        load()
    }

    fun askResendAll() = _uiState.update { it.copy(confirmAll = true) }

    fun dismissResendAll() = _uiState.update { it.copy(confirmAll = false) }

    fun resend(id: String) {
        if (_uiState.value.resendingId != null) return
        _uiState.update { it.copy(resendingId = id, message = null, actionError = null) }
        viewModelScope.launch {
            val result = repository.resend(id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(resendingId = null, message = SupportMessage.RESENT)
                    is AppResult.Failure -> state.copy(resendingId = null, actionError = result.error)
                }
            }
            if (result is AppResult.Success) load()
        }
    }

    fun resendAll() {
        val id = schoolId ?: return
        if (_uiState.value.resendingAll) return
        _uiState.update { it.copy(resendingAll = true, message = null, actionError = null) }
        viewModelScope.launch {
            val result = repository.resendAll(id, _uiState.value.filters)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(resendingAll = false, confirmAll = false, message = SupportMessage.RESENT_ALL)
                    is AppResult.Failure -> state.copy(resendingAll = false, confirmAll = false, actionError = result.error)
                }
            }
            if (result is AppResult.Success) load()
        }
    }

    private fun load() {
        val id = schoolId ?: return
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val state = _uiState.value
            val result = repository.failedNotifications(id, state.filters, state.page, PAGE_SIZE)
            _uiState.update { now ->
                when (result) {
                    is AppResult.Success -> now.copy(isLoading = false, result = result.data)
                    is AppResult.Failure -> now.copy(isLoading = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        const val PAGE_SIZE = 20
    }
}
