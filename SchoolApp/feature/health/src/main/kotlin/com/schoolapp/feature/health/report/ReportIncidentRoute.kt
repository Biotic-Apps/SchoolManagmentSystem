package com.schoolapp.feature.health.report

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.feature.health.R

@Composable
internal fun ReportIncidentRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ReportIncidentViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SecureWindowEffect()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.health_report_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val submitted = state.submitted
        if (submitted != null) {
            IncidentReportedContent(submitted, onDone = onBack, modifier = Modifier.padding(padding))
        } else {
            ReportIncidentForm(
                state = state,
                callbacks = ReportIncidentCallbacks(
                    onQueryChange = viewModel::onQueryChange,
                    onStudentPicked = viewModel::onStudentPicked,
                    onChangeStudent = viewModel::onChangeStudent,
                    onDateChange = viewModel::onDateChange,
                    onTimeChange = viewModel::onTimeChange,
                    onTypeChange = viewModel::onTypeChange,
                    onSeverityChange = viewModel::onSeverityChange,
                    onDescriptionChange = viewModel::onDescriptionChange,
                    onActionTakenChange = viewModel::onActionTakenChange,
                    onAttach = viewModel::onAttach,
                    onRemoveAttachment = viewModel::onRemoveAttachment,
                    onSubmit = viewModel::submit,
                ),
                modifier = Modifier.padding(padding),
            )
        }
    }
}
