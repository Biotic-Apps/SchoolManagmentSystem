package com.schoolapp.feature.exams.sheetstab

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.feature.exams.ExamPermissions
import com.schoolapp.feature.exams.board.CompletenessActions
import com.schoolapp.feature.exams.board.CompletenessScreen
import com.schoolapp.feature.exams.board.CompletenessUiState
import com.schoolapp.feature.exams.board.destinationFor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Mark-sheet completeness of one exam (no exam picker); same cards and rules as the Completeness tab. */
@Composable
internal fun ExamSheetsTab(
    exam: ExamDetail,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ExamSheetsViewModel = hiltViewModel(key = "exam_sheets_${exam.id}"),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(exam.id) { viewModel.start(exam.id) }
    LifecycleResumeEffect(viewModel) {
        viewModel.onResume()
        onPauseOrDispose { }
    }
    CompletenessScreen(
        state = state,
        actions = CompletenessActions(
            onExamSelected = {},
            onFilterSelected = viewModel::onFilterSelected,
            onRefresh = viewModel::refresh,
            onRetrySheets = viewModel::refresh,
            onSheetClick = { sheet -> onOpen(destinationFor(sheet, state)) },
        ),
        modifier = modifier,
        showExamPicker = false,
    )
}

@HiltViewModel
class ExamSheetsViewModel @Inject constructor(
    private val repository: ExamsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(CompletenessUiState(isLoading = false, sheetsLoading = true))
    val uiState: StateFlow<CompletenessUiState> = _uiState.asStateFlow()

    private var job: Job? = null

    fun start(examId: String) {
        if (_uiState.value.selectedExamId == examId) return
        _uiState.update { it.copy(selectedExamId = examId) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canEdit = ExamPermissions.canEdit(session), canApprove = ExamPermissions.canApprove(session)) }
        }
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun onResume() {
        if (!_uiState.value.sheetsLoading && _uiState.value.selectedExamId != null) load(refreshing = false)
    }

    fun onFilterSelected(id: String) = _uiState.update { state -> state.copy(filter = MarkSheetStatus.entries.firstOrNull { it.name == id }) }

    private fun load(refreshing: Boolean) {
        val examId = _uiState.value.selectedExamId ?: return
        job?.cancel()
        _uiState.update { it.copy(sheetsLoading = !refreshing && it.sheets.isEmpty(), isRefreshing = refreshing, sheetsError = null) }
        job = viewModelScope.launch {
            val result = repository.markSheets(examId)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(sheetsLoading = false, isRefreshing = false, sheets = result.data)
                    is AppResult.Failure -> it.copy(sheetsLoading = false, isRefreshing = false, sheetsError = result.error)
                }
            }
        }
    }
}
