package com.schoolapp.feature.exams.print

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.PictureAsPdf
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.exams.admin.JobFileWaiter
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.model.exams.admin.ExamPrintKind
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.OptionPickerField
import com.schoolapp.feature.exams.components.PdfLinkActions

/** Report cards, date sheet and award list PDFs of the exam, each with its scope; open or share when ready. */
@Composable
internal fun ExamPrintTab(
    exam: ExamDetail,
    modifier: Modifier = Modifier,
    viewModel: PrintViewModel = hiltViewModel(key = "exam_print_${exam.id}"),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val allLabel = stringResource(R.string.exams_print_all_classes)
    val classAll = stringResource(R.string.exams_print_class_all_sections)
    LaunchedEffect(exam.id) { viewModel.start(exam, allLabel) { name -> classAll.replace("%1\$s", name) } }
    val noPapers = exam.papers.isEmpty()
    ScreenColumn(modifier) {
        item(key = "cards") {
            PrintCard(ExamPrintKind.REPORT_CARDS, R.string.exams_print_report_cards, R.string.exams_print_report_cards_hint, state, viewModel, exam) {
                if (exam.computedAt == null) InlineMessage(stringResource(R.string.exams_print_report_cards_need_results), StatusTone.Info)
                if (state.templates.isNotEmpty()) {
                    OptionPickerField(
                        label = stringResource(R.string.exams_print_template),
                        options = state.templates.map {
                            SwitcherOption(it.id, if (it.isDefault) stringResource(R.string.exams_print_default_template, it.name) else it.name)
                        },
                        selectedId = state.jobs.getValue(ExamPrintKind.REPORT_CARDS).templateId,
                        onSelect = viewModel::onTemplate,
                    )
                }
            }
        }
        item(key = "date_sheet") {
            PrintCard(ExamPrintKind.DATE_SHEET, R.string.exams_print_date_sheet, R.string.exams_print_date_sheet_hint, state, viewModel, exam) {
                if (noPapers) InlineMessage(stringResource(R.string.exams_print_no_papers), StatusTone.Info)
            }
        }
        item(key = "award_list") {
            PrintCard(ExamPrintKind.AWARD_LIST, R.string.exams_print_award_list, R.string.exams_print_award_list_hint, state, viewModel, exam) {
                val job = state.jobs.getValue(ExamPrintKind.AWARD_LIST)
                OptionPickerField(
                    label = stringResource(R.string.exams_print_subject),
                    options = exam.papers.distinctBy { it.subjectId }.sortedBy { it.subjectName }.map { SwitcherOption(it.subjectId, it.subjectName) },
                    selectedId = job.subjectId,
                    onSelect = { viewModel.onSubject(ExamPrintKind.AWARD_LIST, it) },
                    errorText = if (job.subjectMissing) stringResource(R.string.exams_print_subject_required) else null,
                )
            }
        }
    }
}

@Composable
private fun PrintCard(
    kind: ExamPrintKind,
    title: Int,
    hint: Int,
    state: PrintState,
    viewModel: PrintViewModel,
    exam: ExamDetail,
    extra: @Composable () -> Unit,
) {
    val job = state.jobs.getValue(kind)
    val canRun = when (kind) {
        ExamPrintKind.REPORT_CARDS -> exam.computedAt != null
        ExamPrintKind.DATE_SHEET, ExamPrintKind.AWARD_LIST -> exam.papers.isNotEmpty()
    }
    AppCard(verticalSpacing = 12.dp) {
        Text(stringResource(title), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        Text(stringResource(hint), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        OptionPickerField(
            label = stringResource(R.string.exams_print_scope),
            options = state.targetOptions(withSections = kind != ExamPrintKind.DATE_SHEET),
            selectedId = job.target,
            onSelect = { viewModel.onTarget(kind, it) },
        )
        extra()
        job.error?.let { InlineMessage(pdfError(it), StatusTone.Error) }
        val url = job.url
        if (url != null) {
            InlineMessage(stringResource(R.string.exams_print_ready), StatusTone.Success)
            PdfLinkActions(url, "${exam.name} – ${stringResource(title)}")
        }
        PrimaryButton(
            text = stringResource(if (job.running) R.string.exams_pdf_preparing else R.string.exams_print_generate),
            onClick = { viewModel.generate(kind) },
            modifier = Modifier.fillMaxWidth(),
            enabled = canRun && !job.running,
            loading = job.running,
            leadingIcon = Icons.Outlined.PictureAsPdf,
        )
    }
}

@Composable
internal fun pdfError(error: AppError): String = when ((error as? AppError.Server)?.code) {
    JobFileWaiter.CODE_NOT_READY -> stringResource(R.string.exams_pdf_not_ready)
    JobFileWaiter.CODE_FAILED -> stringResource(R.string.exams_pdf_failed)
    else -> appErrorMessage(error)
}
