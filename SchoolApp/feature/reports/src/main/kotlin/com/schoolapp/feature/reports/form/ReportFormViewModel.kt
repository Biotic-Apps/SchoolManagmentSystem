package com.schoolapp.feature.reports.form

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.reports.RecentExportsStore
import com.schoolapp.core.data.reports.ReportsRepository
import com.schoolapp.core.model.reports.RecentExport
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportFormat
import com.schoolapp.core.model.reports.ReportParamType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

/** Filters for one report; a valid submit queues the export and records it under Recent exports. */
@HiltViewModel
class ReportFormViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: ReportsRepository,
    private val loader: ReportOptionsLoader,
    private val store: RecentExportsStore,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReportFormUiState())
    val uiState: StateFlow<ReportFormUiState> = _uiState.asStateFlow()

    private var sessionBranchId: String? = null
    private var examJob: Job? = null

    fun start(report: Report) {
        val current = _uiState.value
        // Reopening the same report keeps what was typed, unless that export was already queued.
        if (current.report?.key == report.key && current.queuedJobId == null) return
        _uiState.value = ReportFormUiState(report = report, format = report.formats.firstOrNull() ?: ReportFormat.PDF)
        viewModelScope.launch {
            sessionBranchId = authRepository.session.first()?.activeBranchId
            val values = defaultValues(report, sessionBranchId, clock.now().toLocalDate())
            _uiState.update { it.copy(values = values) }
            loadOptions()
        }
    }

    fun retryOptions() = loadOptions()

    /** The host has closed the sheet: the next open starts from fresh defaults. */
    fun onQueuedHandled() {
        examJob?.cancel()
        _uiState.value = ReportFormUiState()
    }

    fun onValueChange(name: String, value: String) {
        _uiState.update { it.copy(values = it.values + (name to value), errors = it.errors - name, submitError = null) }
        if (paramType(name) == ReportParamType.BRANCH && uses(ReportParamType.EXAM)) {
            _uiState.update { it.copy(values = it.values + examValueCleared()) }
            loadExams()
        }
    }

    fun onFormatChange(format: ReportFormat) = _uiState.update { it.copy(format = format) }

    fun submit() {
        val state = _uiState.value
        val report = state.report ?: return
        if (state.isSubmitting) return
        val errors = validate(report, state.values)
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(errors = errors) }
            return
        }
        val request = toRequest(report, state.values, state.format)
        _uiState.update { it.copy(isSubmitting = true, submitError = null) }
        viewModelScope.launch {
            when (val result = repository.generate(request)) {
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, submitError = result.error) }
                is AppResult.Success -> {
                    store.add(RecentExport(result.data, report.title, request, Instant.now().toString()))
                    _uiState.update { it.copy(isSubmitting = false, queuedJobId = result.data) }
                }
            }
        }
    }

    private fun loadOptions() {
        if (uses(ReportParamType.BRANCH) || uses(ReportParamType.SCHOOL)) loadBranches()
        if (uses(ReportParamType.EXAM)) loadExams()
    }

    private fun loadBranches() {
        setOptions(ReportParamType.BRANCH) { it.copy(isLoading = true, error = null) }
        setOptions(ReportParamType.SCHOOL) { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            when (val result = loader.branches()) {
                is AppResult.Failure -> {
                    setOptions(ReportParamType.BRANCH) { ParamOptions(error = result.error) }
                    setOptions(ReportParamType.SCHOOL) { ParamOptions(error = result.error) }
                }
                is AppResult.Success -> {
                    setOptions(ReportParamType.BRANCH) { ParamOptions(result.data.branchOptions()) }
                    setOptions(ReportParamType.SCHOOL) { ParamOptions(result.data.schoolOptions()) }
                    preselectSingleChoices()
                }
            }
        }
    }

    private fun loadExams() {
        examJob?.cancel()
        setOptions(ReportParamType.EXAM) { ParamOptions(isLoading = true) }
        val branchId = paramNamed(ReportParamType.BRANCH)?.let { _uiState.value.values[it] }?.ifBlank { null } ?: sessionBranchId
        examJob = viewModelScope.launch {
            when (val result = loader.exams(branchId)) {
                is AppResult.Failure -> setOptions(ReportParamType.EXAM) { ParamOptions(error = result.error) }
                is AppResult.Success -> setOptions(ReportParamType.EXAM) { ParamOptions(result.data) }
            }
        }
    }

    /** A user who can see only one branch / school gets it filled in. */
    private fun preselectSingleChoices() = _uiState.update { state ->
        val filled = state.report?.params.orEmpty().mapNotNull { param ->
            val single = state.optionsFor(param.type).options.singleOrNull()
            if (single != null && state.values[param.name].isNullOrBlank()) param.name to single.id else null
        }
        state.copy(values = state.values + filled)
    }

    private fun examValueCleared(): Map<String, String> = paramNamed(ReportParamType.EXAM)?.let { mapOf(it to "") }.orEmpty()

    private fun uses(type: ReportParamType) = _uiState.value.report?.params.orEmpty().any { it.type == type }

    private fun paramNamed(type: ReportParamType) = _uiState.value.report?.params?.firstOrNull { it.type == type }?.name

    private fun paramType(name: String) = _uiState.value.report?.params?.firstOrNull { it.name == name }?.type

    private fun setOptions(type: ReportParamType, change: (ParamOptions) -> ParamOptions) =
        _uiState.update { it.copy(options = it.options + (type to change(it.optionsFor(type)))) }
}
