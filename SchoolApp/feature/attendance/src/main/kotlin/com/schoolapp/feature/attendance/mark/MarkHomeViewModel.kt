package com.schoolapp.feature.attendance.mark

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.attendance.AttendanceRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Teacher / helper "Mark attendance" home: a date and the user's sections with each register's status. */
@HiltViewModel
class MarkHomeViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val scopedSections: ScopedSections,
    private val repository: AttendanceRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = clock.now().toLocalDate().toString()
    private val _uiState = MutableStateFlow(MarkHomeUiState(date = today, today = today))
    val uiState: StateFlow<MarkHomeUiState> = _uiState.asStateFlow()

    private var statusJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.sections.isEmpty(), error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(showLeaveReview = session.activeRole == RoleKey.TEACHER) }
            when (val result = scopedSections.load()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val rows = result.data
                        .sortedWith(compareBy({ it.className }, { it.name }))
                        .map { SectionRegisterRow(it.id, listOfNotNull(it.className, it.name).joinToString(" - "), it.studentCount) }
                    _uiState.update { it.copy(isLoading = false, sections = rows) }
                    refreshStatuses()
                }
            }
        }
    }

    fun onDateSelected(date: String) {
        if (date > today || date == _uiState.value.date) return
        _uiState.update { state -> state.copy(date = date, sections = state.sections.map { it.copy(status = null, hasUnsent = false) }) }
        refreshStatuses()
    }

    /** Re-reads each section's register for the selected date (also after returning from a register). */
    fun refreshStatuses() {
        val state = _uiState.value
        if (state.sections.isEmpty()) return
        statusJob?.cancel()
        statusJob = viewModelScope.launch {
            coroutineScope {
                state.sections.forEach { section ->
                    launch {
                        val loaded = (repository.register(section.sectionId, state.date) as? AppResult.Success)?.data ?: return@launch
                        _uiState.update { current ->
                            if (current.date != state.date) return@update current
                            current.copy(
                                sections = current.sections.map {
                                    if (it.sectionId == section.sectionId) it.copy(status = loaded.register.status, hasUnsent = loaded.localMarks != null) else it
                                },
                            )
                        }
                    }
                }
            }
        }
    }
}
