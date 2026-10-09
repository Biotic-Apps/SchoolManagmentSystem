package com.schoolapp.feature.meetings.book

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.MeetingRequestInput
import com.schoolapp.core.model.meeting.MeetingSlot
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Parent picks one of the active child's teachers, then books one of their open slots within the
 * next [DAYS_AHEAD] days — or, when the teacher has none (or none suits), suggests a time the
 * teacher confirms or declines.
 */
@HiltViewModel
class BookMeetingViewModel @Inject constructor(
    private val repository: MeetingsRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(BookMeetingUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<BookMeetingUiState> = _uiState.asStateFlow()

    private var slots: List<MeetingSlot> = emptyList()

    init {
        viewModelScope.launch {
            val child = authRepository.session.filterNotNull().first().activeChild
            _uiState.update { it.copy(childId = child?.id, childName = child?.fullName) }
            load()
        }
    }

    fun retry() {
        viewModelScope.launch { load() }
    }

    fun onTeacherSelected(userId: String) {
        if (_uiState.value.isBooking) return
        _uiState.update { it.copy(teacherId = userId, selected = null, slotTaken = false, bookError = null).withDays() }
        // Nothing to book: go straight to suggesting a time.
        if (_uiState.value.days.isEmpty()) onSuggestTime()
    }

    fun onSlotSelected(slotId: String) {
        val slot = _uiState.value.days.flatMap { it.slots }.firstOrNull { it.id == slotId } ?: return
        _uiState.update { it.copy(selected = slot, slotTaken = false, bookError = null) }
    }

    fun onChangeSlot() {
        if (_uiState.value.isBooking) return
        _uiState.update { it.copy(selected = null, bookError = null) }
    }

    fun onSuggestTime() {
        if (_uiState.value.teacherId == null || _uiState.value.isBooking) return
        val tomorrow = clock.now().toLocalDate().plusDays(1).toString()
        _uiState.update { it.copy(request = it.request ?: RequestDraft(tomorrow), selected = null, bookError = null) }
    }

    fun onCloseRequest() {
        if (_uiState.value.isBooking) return
        _uiState.update { it.copy(request = null, bookError = null) }
    }

    fun onRequestDate(date: String) = editRequest { it.copy(date = date) }
    fun onRequestTime(time: String) = editRequest { it.copy(startTime = time) }
    fun onRequestMode(mode: MeetingMode) = editRequest { it.copy(mode = mode) }

    fun onAgendaChange(value: String) = _uiState.update { it.copy(agenda = value, agendaMissing = false) }

    fun book() {
        val state = _uiState.value
        val slot = state.selected ?: return
        val childId = state.childId ?: return
        if (!readyToSend(state)) return
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

    fun sendRequest() {
        val state = _uiState.value
        val draft = state.request ?: return
        val childId = state.childId ?: return
        val teacherId = state.teacherId ?: return
        if (!readyToSend(state)) return
        _uiState.update { it.copy(isBooking = true, bookError = null) }
        viewModelScope.launch {
            val input = MeetingRequestInput(childId, teacherId, draft.date, draft.startTime, draft.mode, state.agenda.trim())
            when (val result = repository.request(input)) {
                is AppResult.Success -> _uiState.update { it.copy(isBooking = false, requested = true) }
                is AppResult.Failure -> _uiState.update { it.copy(isBooking = false, bookError = result.error) }
            }
        }
    }

    private fun readyToSend(state: BookMeetingUiState): Boolean {
        if (state.isBooking || state.booked || state.requested) return false
        if (state.agenda.isBlank()) {
            _uiState.update { it.copy(agendaMissing = true) }
            return false
        }
        return true
    }

    private fun editRequest(transform: (RequestDraft) -> RequestDraft) =
        _uiState.update { state -> state.request?.let { state.copy(request = transform(it)) } ?: state }

    private suspend fun load() {
        val childId = _uiState.value.childId
        _uiState.update { it.copy(isLoading = it.teachers.isEmpty() && it.days.isEmpty(), error = null) }
        val teachers = childId?.let { id -> viewModelScope.async { repository.teachers(id) } }
        loadSlots()
        when (val result = teachers?.await()) {
            null -> Unit
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            is AppResult.Success -> _uiState.update { it.copy(teachers = result.data) }
        }
    }

    private suspend fun loadSlots() {
        val today = clock.now().toLocalDate()
        when (val result = repository.openSlots(from = today.toString(), to = today.plusDays(DAYS_AHEAD - 1).toString())) {
            is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            is AppResult.Success -> {
                slots = result.data.filter { it.status == null || it.status == OPEN }
                _uiState.update { it.copy(isLoading = false).withDays() }
            }
        }
    }

    private fun BookMeetingUiState.withDays(): BookMeetingUiState {
        val days = slots
            .filter { teacherId == null || it.staff?.id == teacherId }
            .sortedWith(compareBy({ it.date }, { it.startTime }))
            .groupBy { it.date }
            .map { (date, daySlots) -> SlotDay(date, daySlots) }
        return copy(days = days)
    }

    private fun AppError.isConflict(): Boolean = this is AppError.Server && httpCode == CONFLICT

    private companion object {
        const val DAYS_AHEAD = 14L
        const val CONFLICT = 409
        const val OPEN = "OPEN"
    }
}
