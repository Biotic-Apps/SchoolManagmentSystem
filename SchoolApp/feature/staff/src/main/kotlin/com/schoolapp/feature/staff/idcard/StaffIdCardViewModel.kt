package com.schoolapp.feature.staff.idcard

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.staff.idcard.StaffIdCardRepository
import com.schoolapp.core.model.staff.idcard.IdCardStatus
import com.schoolapp.core.model.staff.idcard.StaffIdCard
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Staff ID card status; polls every 2 s while a card renders and the tab is on screen. */
@HiltViewModel
class StaffIdCardViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StaffIdCardRepository,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }
    private val _uiState = MutableStateFlow(StaffIdCardUiState())
    val uiState: StateFlow<StaffIdCardUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var pollJob: Job? = null
    private var visible = false

    init {
        load()
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    /** Called by the tab's lifecycle: polling runs only while the tab is started and on screen. */
    fun setVisible(value: Boolean) {
        visible = value
        if (value) maybePoll() else stopPolling()
    }

    fun generate() {
        if (_uiState.value.isPending) return
        _uiState.update { it.copy(isGenerating = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.generate(staffId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isGenerating = false, actionError = result.error) }
                is AppResult.Success -> {
                    _uiState.update { it.copy(notice = IdCardNotice.QUEUED) }
                    fetch()
                    _uiState.update { it.copy(isGenerating = false) }
                    maybePoll()
                }
            }
        }
    }

    /** Re-reads the card so the opened link is freshly signed. */
    fun download() {
        if (_uiState.value.isOpening) return
        _uiState.update { it.copy(isOpening = true, actionError = null) }
        viewModelScope.launch {
            val result = repository.card(staffId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Failure -> state.copy(isOpening = false, actionError = result.error)
                    is AppResult.Success -> state.copy(isOpening = false, card = result.data, openUrl = result.data?.fileUrl)
                }
            }
        }
    }

    fun onUrlOpened() = _uiState.update { it.copy(openUrl = null) }

    fun consumeNotice() = _uiState.update { it.copy(notice = null) }

    fun consumeActionError() = _uiState.update { it.copy(actionError = null) }

    private fun load() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            fetch()
            maybePoll()
        }
    }

    /** [quiet] (polling): a failed tick keeps the current state; the next tick retries. */
    private suspend fun fetch(quiet: Boolean = false) {
        val result = repository.card(staffId)
        _uiState.update { state ->
            when (result) {
                is AppResult.Success -> state.copy(
                    isLoading = false, isRefreshing = false, error = null, card = result.data,
                    notice = if (state.card.isPending() && result.data?.status == IdCardStatus.READY) IdCardNotice.READY else state.notice,
                )
                is AppResult.Failure -> if (quiet) {
                    state
                } else if (state.isLoading || state.card == null) {
                    state.copy(isLoading = false, isRefreshing = false, error = result.error)
                } else {
                    state.copy(isRefreshing = false, actionError = result.error)
                }
            }
        }
    }

    private fun maybePoll() {
        if (!visible || pollJob?.isActive == true || !_uiState.value.card.isPending()) return
        pollJob = viewModelScope.launch {
            while (_uiState.value.card.isPending()) {
                delay(POLL_MS)
                fetch(quiet = true)
            }
        }
    }

    private fun stopPolling() {
        pollJob?.cancel()
        pollJob = null
    }

    private fun StaffIdCard?.isPending() = this?.status == IdCardStatus.PENDING

    private companion object {
        const val POLL_MS = 2_000L
    }
}
