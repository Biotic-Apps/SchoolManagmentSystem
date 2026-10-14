package com.schoolapp.feature.exams.detail

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.examStatusLabel
import com.schoolapp.feature.exams.manage.form.ExamFormSheet
import com.schoolapp.feature.exams.overview.ExamOverviewTab
import com.schoolapp.feature.exams.print.ExamPrintTab
import com.schoolapp.feature.exams.schedule.ExamScheduleTab
import com.schoolapp.feature.exams.sheetstab.ExamSheetsTab
import com.schoolapp.feature.exams.skillstab.ExamSkillsTab

private enum class ExamTab(val title: Int) {
    OVERVIEW(R.string.exams_detail_tab_overview),
    SCHEDULE(R.string.exams_detail_tab_schedule),
    SHEETS(R.string.exams_detail_tab_sheets),
    SKILLS(R.string.exams_detail_tab_skills),
    PRINT(R.string.exams_detail_tab_print),
}

/** Exam workspace (web `exams/[id]`): overview & workflow, date sheet, mark sheets, behaviour & skills, print. */
@Composable
internal fun ExamDetailRoute(
    onBack: () -> Unit,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ExamDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val exam = state.exam
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.title,
                subtitle = exam?.let { examStatusLabel(it.status) },
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        when {
            exam != null -> ExamTabs(exam, state, viewModel, onOpen, Modifier.padding(padding))
            state.isLoading -> LoadingState(Modifier.padding(padding))
            else -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), Modifier.padding(padding), onRetry = viewModel::retry)
        }
    }
    if (state.editing && exam != null) {
        ExamFormSheet(exam = exam, onDismiss = viewModel::closeEdit, onSaved = {
            viewModel.closeEdit()
            viewModel.onExamChanged(it)
        })
    }
}

@Composable
private fun ExamTabs(exam: ExamDetail, state: ExamDetailUiState, viewModel: ExamDetailViewModel, onOpen: (Any) -> Unit, modifier: Modifier) {
    val tabs = ExamTab.entries.filter { tab ->
        when (tab) {
            ExamTab.SHEETS -> exam.status >= ExamStatus.MARKS_OPEN
            ExamTab.SKILLS -> exam.status >= ExamStatus.SCHEDULED
            else -> true
        }
    }
    var selected by rememberSaveable { mutableStateOf(ExamTab.OVERVIEW.name) }
    val tab = tabs.firstOrNull { it.name == selected } ?: ExamTab.OVERVIEW
    Column(modifier.fillMaxSize()) {
        AppTabs(titles = tabs.map { stringResource(it.title) }, selectedIndex = tabs.indexOf(tab), onSelect = { selected = tabs[it].name })
        val content = Modifier.weight(1f)
        when (tab) {
            ExamTab.OVERVIEW -> ExamOverviewTab(
                exam = exam,
                isRefreshing = state.isRefreshing,
                onRefresh = viewModel::refresh,
                onExamChanged = viewModel::onExamChanged,
                onEdit = if (state.canEdit && exam.status < ExamStatus.RESULTS_APPROVED) viewModel::openEdit else null,
                modifier = content,
            )
            ExamTab.SCHEDULE -> ExamScheduleTab(exam, viewModel::onExamChanged, content)
            ExamTab.SHEETS -> ExamSheetsTab(exam, onOpen, content)
            ExamTab.SKILLS -> ExamSkillsTab(exam, onOpen, content)
            ExamTab.PRINT -> ExamPrintTab(exam, content)
        }
    }
}
