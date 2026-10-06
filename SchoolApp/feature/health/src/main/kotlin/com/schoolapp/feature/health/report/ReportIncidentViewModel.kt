package com.schoolapp.feature.health.report

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.data.health.HealthRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.health.IncidentInput
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.model.health.IncidentType
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.health.components.StudentSearch
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Staff first-aid report; guardians are notified by the server on submit (principal too when SERIOUS). */
@HiltViewModel
class ReportIncidentViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val healthRepository: HealthRepository,
    private val studentsRepository: StudentsRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val initialStudentId: String? = savedStateHandle["studentId"]

    private val _uiState = MutableStateFlow(initialState(initialStudentId))
    val uiState: StateFlow<ReportIncidentUiState> = _uiState.asStateFlow()

    private val search = StudentSearch(viewModelScope, studentsRepository) { transform ->
        _uiState.update { it.copy(search = transform(it.search)) }
    }

    init {
        if (initialStudentId != null) {
            viewModelScope.launch {
                val result = studentsRepository.student(initialStudentId)
                if (result is AppResult.Success) _uiState.update { it.copy(studentName = result.data.summary.name) }
            }
        }
    }

    private fun initialState(studentId: String?): ReportIncidentUiState {
        val now = clock.now()
        return ReportIncidentUiState(
            studentId = studentId,
            studentLocked = studentId != null,
            today = now.toLocalDate().toString(),
            date = now.toLocalDate().toString(),
            time = TimeFormat.toApiTime(now.toLocalTime()),
        )
    }

    fun onQueryChange(query: String) = search.onQueryChange(query)

    fun onStudentPicked(student: StudentSummary) {
        search.clear()
        _uiState.update { it.copy(studentId = student.id, studentName = student.name, errors = it.errors - IncidentField.STUDENT) }
    }

    fun onChangeStudent() {
        if (_uiState.value.studentLocked) return
        _uiState.update { it.copy(studentId = null, studentName = null) }
    }

    fun onDateChange(date: String) = _uiState.update { it.copy(date = date, errors = it.errors - IncidentField.FUTURE_TIME) }

    fun onTimeChange(time: String) = _uiState.update { it.copy(time = time, errors = it.errors - IncidentField.FUTURE_TIME) }

    fun onTypeChange(type: IncidentType) = _uiState.update { it.copy(type = type) }

    fun onSeverityChange(severity: IncidentSeverity) = _uiState.update { it.copy(severity = severity) }

    fun onDescriptionChange(text: String) = _uiState.update { it.copy(description = text, errors = it.errors - IncidentField.DESCRIPTION) }

    fun onActionTakenChange(text: String) = _uiState.update { it.copy(actionTaken = text, errors = it.errors - IncidentField.ACTION_TAKEN) }

    fun submit() {
        val state = _uiState.value
        if (state.isSaving || state.submitted != null) return
        val errors = validateIncident(state, clock.now())
        val occurred = localDateTime(state.date, state.time)
        if (errors.isNotEmpty() || occurred == null || state.studentId == null) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        _uiState.update { it.copy(isSaving = true, error = null, errors = emptySet()) }
        val input = IncidentInput(
            studentId = state.studentId,
            occurredAt = toUtcInstant(occurred),
            type = state.type,
            severity = state.severity,
            description = state.description.trim(),
            actionTaken = state.actionTaken.trim(),
        )
        viewModelScope.launch {
            when (val result = healthRepository.reportIncident(input)) {
                is AppResult.Success -> _uiState.update { it.copy(isSaving = false, submitted = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, error = result.error) }
            }
        }
    }
}
