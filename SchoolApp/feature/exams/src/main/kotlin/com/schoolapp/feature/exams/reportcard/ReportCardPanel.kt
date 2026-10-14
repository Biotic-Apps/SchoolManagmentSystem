package com.schoolapp.feature.exams.reportcard

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.exams.ReportCardStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.PdfLinkActions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class ReportCardPanelState(
    val loading: Boolean = true,
    val status: ReportCardStatus? = null,
    val url: String? = null,
    /** No card yet: cards are generated when results are published. */
    val missing: Boolean = false,
    val error: AppError? = null,
)

/** A student's report card for one exam: preparing (polled), ready (open / share), failed or not generated yet. */
@Composable
internal fun ReportCardPanel(studentId: String, examId: String, title: String, modifier: Modifier = Modifier) {
    val viewModel: ReportCardViewModel = hiltViewModel(key = "report_card_${studentId}_$examId")
    val state by viewModel.state.collectAsStateWithLifecycle()
    LaunchedEffect(studentId, examId) { viewModel.start(studentId, examId) }
    SectionHeader(title = stringResource(R.string.exams_rc_heading), modifier = modifier)
    val url = state.url
    when {
        url != null -> PdfLinkActions(url, title)
        state.loading || state.status == ReportCardStatus.PENDING -> InlineMessage(stringResource(R.string.exams_report_card_preparing), StatusTone.Info)
        state.missing -> InlineMessage(stringResource(R.string.exams_report_card_missing), StatusTone.Info)
        else -> {
            val text = state.error?.let { appErrorMessage(it) } ?: stringResource(R.string.exams_rc_failed)
            InlineMessage(text, StatusTone.Error)
            SecondaryButton(stringResource(R.string.exams_report_card_retry), viewModel::retry, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Refresh)
        }
    }
}

@HiltViewModel
class ReportCardViewModel @Inject constructor(private val repository: ExamsRepository) : ViewModel() {
    private val _state = MutableStateFlow(ReportCardPanelState())
    val state: StateFlow<ReportCardPanelState> = _state.asStateFlow()

    private var ids: Pair<String, String>? = null
    private var job: Job? = null

    fun start(studentId: String, examId: String) {
        if (ids == studentId to examId && _state.value.url != null) return
        ids = studentId to examId
        retry()
    }

    fun retry() {
        val (studentId, examId) = ids ?: return
        job?.cancel()
        _state.value = ReportCardPanelState()
        job = viewModelScope.launch {
            repeat(MAX_POLLS) {
                when (val result = repository.reportCard(studentId, examId)) {
                    is AppResult.Failure -> {
                        val missing = (result.error as? AppError.Server)?.httpCode == HTTP_NOT_FOUND
                        _state.value = ReportCardPanelState(loading = false, missing = missing, error = result.error.takeUnless { missing })
                        return@launch
                    }
                    is AppResult.Success -> {
                        val card = result.data
                        val url = card.fileUrl?.takeIf { card.status == ReportCardStatus.READY && it.isNotBlank() }
                        _state.update { it.copy(loading = false, status = card.status, url = url) }
                        if (url != null || card.status == ReportCardStatus.FAILED) return@launch
                    }
                }
                delay(POLL_MS)
            }
        }
    }

    private companion object {
        const val MAX_POLLS = 30
        const val POLL_MS = 2_000L
        const val HTTP_NOT_FOUND = 404
    }
}
