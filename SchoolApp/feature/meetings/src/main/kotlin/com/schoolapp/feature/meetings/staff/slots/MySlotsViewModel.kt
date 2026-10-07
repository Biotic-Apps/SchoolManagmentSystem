package com.schoolapp.feature.meetings.staff.slots

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.SlotStatus
import com.schoolapp.feature.meetings.book.SlotDay
import com.schoolapp.feature.meetings.domain.SlotDraft
import com.schoolapp.feature.meetings.domain.SlotTimes
import com.schoolapp.feature.meetings.domain.SlotValidator
import com.schoolapp.feature.meetings.domain.SlotsForm
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/** Staff publish bookable meeting slots, browse their own week by week and withdraw free ones. */
@HiltViewModel
class MySlotsViewModel @Inject constructor(
    private val repository: MeetingsRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(MySlotsUiState())
    val uiState: StateFlow<MySlotsUiState> = _uiState.asStateFlow()

    private var staffUserId: String? = null
    private var week: LocalDate = SlotTimes.weekStart(today())
    private var loadJob: Job? = null
    private var loadedOnce = false

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canPublish = session.activeRole != RoleKey.PARENT && session.has(PUBLISH_PERMISSION)
            staffUserId = session.user.id.takeIf { canPublish }
            _uiState.update { it.copy(canPublish = canPublish, isLoading = canPublish) }
            if (canPublish) load(refreshing = false)
        }
    }

    fun previousWeek() = showWeek(week.minusWeeks(1))

    fun nextWeek() = showWeek(week.plusWeeks(1))

    fun thisWeek() = showWeek(SlotTimes.weekStart(today()))

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    /** Back on screen: bookings made by parents meanwhile turn free slots into booked ones. */
    fun onResume() {
        if (loadedOnce && _uiState.value.sheet == null) load(refreshing = false)
    }

    /** Starts on the shown week's Monday, or today when that is already past (as on web). */
    fun openSheet() {
        val today = today().toString()
        val start = maxOf(week.toString(), today)
        _uiState.update {
            it.copy(sheet = PublishSlotsSheetState(SlotsForm.start(start), minDate = today), notice = null, actionError = null)
        }
    }

    fun dismissSheet() = _uiState.update { if (it.sheet?.isSaving == true) it else it.copy(sheet = null) }

    fun addRow() = editForm { it.addRow() }

    fun removeRow(key: Int) = editForm { it.removeRow(key) }

    fun updateDraft(key: Int, transform: (SlotDraft) -> SlotDraft) = editForm { it.update(key, transform) }

    fun publish() {
        val sheet = _uiState.value.sheet ?: return
        if (sheet.isSaving) return
        val problems = SlotValidator.validate(sheet.form.drafts, clock.now())
        if (problems.isNotEmpty()) {
            _uiState.update { it.copy(sheet = sheet.copy(problems = problems, error = null)) }
            return
        }
        _uiState.update { it.copy(sheet = sheet.copy(problems = emptyMap(), isSaving = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.publishSlots(sheet.form.toInputs())) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(sheet = null, notice = SlotsNotice.Published(result.data.size)) }
                    load(refreshing = false)
                }
                is AppResult.Failure -> _uiState.update { state ->
                    state.copy(sheet = state.sheet?.copy(isSaving = false, error = result.error))
                }
            }
        }
    }

    /** Only free (OPEN) slots can be withdrawn; booked ones are cancelled from the meeting instead. */
    fun askDelete(slot: MeetingSlot) {
        if (slot.isFree()) _uiState.update { it.copy(deleteTarget = slot, notice = null, actionError = null) }
    }

    fun dismissDelete() = _uiState.update { it.copy(deleteTarget = null) }

    fun confirmDelete() {
        val target = _uiState.value.deleteTarget ?: return
        if (_uiState.value.deletingId != null) return
        _uiState.update { it.copy(deleteTarget = null, deletingId = target.id) }
        viewModelScope.launch {
            when (val result = repository.removeSlot(target.id)) {
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(deletingId = null, notice = SlotsNotice.Removed, days = state.days.without(target.id))
                }
                is AppResult.Failure -> {
                    _uiState.update { it.copy(deletingId = null, actionError = result.error) }
                    load(refreshing = false)
                }
            }
        }
    }

    private fun editForm(transform: (SlotsForm) -> SlotsForm) = _uiState.update { state ->
        val sheet = state.sheet
        if (sheet == null || sheet.isSaving) state else state.copy(sheet = sheet.copy(form = transform(sheet.form), problems = emptyMap()))
    }

    private fun showWeek(start: LocalDate) {
        if (start == week) return
        week = start
        load(refreshing = false)
    }

    private fun load(refreshing: Boolean) {
        val userId = staffUserId ?: return
        val from = week
        val to = week.plusDays(DAYS_IN_WEEK - 1)
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update {
                it.copy(
                    isLoading = !refreshing && it.weekStart != from.toString(),
                    isRefreshing = refreshing,
                    error = null,
                    weekStart = from.toString(),
                    weekEnd = to.toString(),
                    isThisWeek = from == SlotTimes.weekStart(today()),
                )
            }
            when (val result = repository.mySlots(userId, from.toString(), to.toString())) {
                is AppResult.Success -> {
                    loadedOnce = true
                    _uiState.update { it.copy(isLoading = false, isRefreshing = false, days = result.data.toDays()) }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error) }
            }
        }
    }

    private fun today(): LocalDate = clock.now().toLocalDate()

    private companion object {
        const val PUBLISH_PERMISSION = "meetings.add"
        const val DAYS_IN_WEEK = 7L
    }
}

/** Free slots can be withdrawn; booked ones belong to a meeting. */
internal fun MeetingSlot.isFree(): Boolean = status == null || status == SlotStatus.OPEN

private fun List<MeetingSlot>.toDays(): List<SlotDay> =
    sortedWith(compareBy({ it.date }, { it.startTime })).groupBy { it.date }.map { (date, slots) -> SlotDay(date, slots) }

private fun List<SlotDay>.without(slotId: String): List<SlotDay> =
    map { day -> day.copy(slots = day.slots.filterNot { it.id == slotId }) }.filter { it.slots.isNotEmpty() }
