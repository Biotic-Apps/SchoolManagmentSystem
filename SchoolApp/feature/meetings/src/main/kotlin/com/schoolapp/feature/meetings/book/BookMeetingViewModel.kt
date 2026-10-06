package com.schoolapp.feature.meetings.book

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent books an open slot within the next [DAYS_AHEAD] days for the active child. */
@HiltViewModel
class BookMeetingViewModel @Inject constructor(
    private val repository: MeetingsRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(BookMeetingUiState())
    val uiState: StateFlow<BookMeetingUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val child = authRepository.session.filterNotNull().first().activeChild
            _uiState.update { it.copy(childId = child?.id, childName = child?.fullName) }
            loadSlots()
        }
    }

    fun retry() {
        viewModelScope.launch { loadSlots() }
    }

    fun onSlotSelected(slotId: String) {
        val slot = _uiState.value.days.flatMap { it.slots }.firstOrNull { it.id == slotId } ?: return
        _uiState.update { it.copy(selected = slot, slotTaken = false, bookError = null) }
    }

    fun onChangeSlot() {
        if (_uiState.value.isBooking) return
        _uiState.update { it.copy(selected = null, bookError = null) }
    }

    fun onAgendaChange(value: String) = _uiState.update { it.copy(agenda = value, agendaMissing = false) }

    fun book() {
        val state = _uiState.value
        val slot = state.selected ?: return
        val childId = state.childId ?: return
        if (state.isBooking || state.booked) return
        if (state.agenda.isBlank()) {
            _uiState.update { it.copy(agendaMissing = true) }
            return
        }
        _uiState.update { it.copy(isBooking = true, bookError = null) }
        viewModelScope.launch {
            when (val result = repository.book(slot.id, childId, state.agenda.trim())) {
                is AppResult.Success -> _uiState.update { it.copy(isBooking = false, booked = true) }
                is AppResult.Failure -> if (result.error.isConflict()) {
                    _uiState.update { it.copy(isBooking = false, selected = null, slotTaken = true) }
                    loadSlots()
                } else {
                    _uiState.update { it.copy(isBooking = false, bookError = result.error) }
                }
            }
        }
    }

    private suspend fun loadSlots() {
        _uiState.update { it.copy(isLoading = it.days.isEmpty(), error = null) }
        val today = clock.now().toLocalDate()
        val result = repository.openSlots(from = today.toString(), to = today.plusDays(DAYS_AHEAD - 1).toString())
        when (result) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            is AppResult.Success -> {
                val days = result.data
                    .filter { it.status == null || it.status == OPEN }
                    .sortedWith(compareBy({ it.date }, { it.startTime }))
                    .groupBy { it.date }
                    .map { (date, slots) -> SlotDay(date, slots) }
                _uiState.update { it.copy(isLoading = false, days = days) }
            }
        }
    }

    private fun AppError.isConflict(): Boolean = this is AppError.Server && httpCode == CONFLICT

    private companion object {
        const val DAYS_AHEAD = 14L
        const val CONFLICT = 409
        const val OPEN = "OPEN"
    }
}
