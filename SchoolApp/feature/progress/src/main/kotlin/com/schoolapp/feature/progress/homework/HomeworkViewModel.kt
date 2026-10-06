package com.schoolapp.feature.progress.homework

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.core.model.progress.HomeworkTick
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Homework tab: section + date → diary entries with homework → per-student DONE / PARTIAL / NOT DONE ticks. */
@HiltViewModel
class HomeworkViewModel @Inject constructor(
    private val scopedSections: ScopedSections,
    private val diaryRepository: DiaryRepository,
    private val studentsRepository: StudentsRepository,
    private val progressRepository: ProgressRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = clock.now().toLocalDate().toString()
    private val _uiState = MutableStateFlow(HomeworkUiState(today = today, date = today))
    val uiState: StateFlow<HomeworkUiState> = _uiState.asStateFlow()

    private var entriesJob: Job? = null
    private var rosterJob: Job? = null

    init {
        load()
    }

    fun retry() = load()

    fun onSectionSelected(sectionId: String) {
        if (sectionId == _uiState.value.selectedSectionId) return
        _uiState.update { it.copy(selectedSectionId = sectionId) }
        loadEntries()
    }

    fun onDateChange(date: String) {
        val clamped = minOf(date, today)
        if (clamped == _uiState.value.date) return
        _uiState.update { it.copy(date = clamped) }
        loadEntries()
    }

    fun retryEntries() = loadEntries()

    fun onEntrySelected(entry: DiaryEntry) {
        _uiState.update { it.copy(selectedEntry = entry, ticks = emptyMap(), message = null, roster = emptyList()) }
        loadRoster(entry.sectionId)
    }

    fun clearEntry() {
        if (_uiState.value.isSaving) return
        rosterJob?.cancel()
        _uiState.update { it.copy(selectedEntry = null, roster = emptyList(), ticks = emptyMap(), rosterError = null, message = null) }
    }

    fun retryRoster() {
        _uiState.value.selectedEntry?.let { loadRoster(it.sectionId) }
    }

    fun onTick(studentId: String, status: HomeworkStatus) =
        _uiState.update { it.copy(ticks = it.ticks + (studentId to status), message = null) }

    fun markAllDone() =
        _uiState.update { state -> state.copy(ticks = state.roster.associate { it.id to HomeworkStatus.DONE }, message = null) }

    fun save() {
        val state = _uiState.value
        val entry = state.selectedEntry ?: return
        if (state.isSaving) return
        if (state.ticks.isEmpty()) {
            _uiState.update { it.copy(message = HomeworkMessage.NeedTick) }
            return
        }
        val ticks = state.roster.mapNotNull { student -> state.ticks[student.id]?.let { HomeworkTick(student.id, it) } }
        _uiState.update { it.copy(isSaving = true, message = null) }
        viewModelScope.launch {
            val result = progressRepository.saveHomeworkStatus(entry.id, ticks)
            _uiState.update {
                it.copy(
                    isSaving = false,
                    message = when (result) {
                        is AppResult.Success -> HomeworkMessage.Saved
                        is AppResult.Failure -> HomeworkMessage.Failed(result.error)
                    },
                )
            }
        }
    }

    private fun load() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            when (val result = scopedSections.load()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val selected = _uiState.value.selectedSectionId?.takeIf { id -> result.data.any { it.id == id } }
                        ?: result.data.firstOrNull()?.id
                    _uiState.update { it.copy(isLoading = false, sections = result.data, selectedSectionId = selected) }
                    if (selected != null) loadEntries()
                }
            }
        }
    }

    private fun loadEntries() {
        val sectionId = _uiState.value.selectedSectionId ?: return
        val date = _uiState.value.date
        entriesJob?.cancel()
        rosterJob?.cancel()
        _uiState.update {
            it.copy(
                isLoadingEntries = true, entriesError = null, entries = emptyList(),
                selectedEntry = null, roster = emptyList(), ticks = emptyMap(), message = null,
            )
        }
        entriesJob = viewModelScope.launch {
            val result = diaryRepository.entries(sectionId, date = date)
            _uiState.update { current ->
                if (current.selectedSectionId != sectionId || current.date != date) return@update current
                when (result) {
                    is AppResult.Success -> current.copy(
                        isLoadingEntries = false,
                        entries = result.data.filter { it.sectionId == sectionId && it.date == date && it.status != DiaryStatus.DRAFT && !it.homework.isNullOrBlank() },
                    )
                    is AppResult.Failure -> current.copy(isLoadingEntries = false, entriesError = result.error)
                }
            }
        }
    }

    private fun loadRoster(sectionId: String) {
        rosterJob?.cancel()
        _uiState.update { it.copy(isLoadingRoster = true, rosterError = null) }
        rosterJob = viewModelScope.launch {
            val result = studentsRepository.students(sectionId)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(
                        isLoadingRoster = false,
                        roster = result.data.sortedWith(compareBy<StudentSummary, Int?>(nullsLast()) { it.rollNo }.thenBy { it.name }),
                    )
                    is AppResult.Failure -> current.copy(isLoadingRoster = false, rosterError = result.error)
                }
            }
        }
    }
}
