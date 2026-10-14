package com.schoolapp.feature.exams.print

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.exams.admin.ExamAdminRepository
import com.schoolapp.core.data.exams.templates.ReportCardTemplatesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.model.exams.admin.ExamPrintInput
import com.schoolapp.core.model.exams.admin.ExamPrintKind
import com.schoolapp.core.model.exams.templates.ReportCardTemplate
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One print card: scope ("all", "class:<id>", "section:<id>"), its PDF job and result. */
@Immutable
data class PrintJob(
    val target: String = ALL_TARGET,
    val subjectId: String? = null,
    val templateId: String? = null,
    val running: Boolean = false,
    val url: String? = null,
    val error: AppError? = null,
    val subjectMissing: Boolean = false,
)

@Immutable
data class PrintState(
    val examId: String? = null,
    /** Whole exam, each class, then each of its sections. */
    val targets: List<PrintTarget> = emptyList(),
    val templates: List<ReportCardTemplate> = emptyList(),
    val jobs: Map<ExamPrintKind, PrintJob> = ExamPrintKind.entries.associateWith { PrintJob() },
)

@Immutable
data class PrintTarget(val id: String, val label: String, val isSection: Boolean)

/** Exam PDFs (web PrintTab): report cards (template choice), date sheet and award lists, then open or share. */
@HiltViewModel
class PrintViewModel @Inject constructor(
    private val repository: ExamAdminRepository,
    private val organisation: OrganisationRepository,
    private val templates: ReportCardTemplatesRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(PrintState())
    val state: StateFlow<PrintState> = _state.asStateFlow()

    fun start(exam: ExamDetail, allLabel: String, classAllLabel: (String) -> String) {
        if (_state.value.examId == exam.id) return
        val classTargets = exam.classes.mapNotNull { c -> c.id?.let { PrintTarget("$CLASS_PREFIX$it", classAllLabel(c.name), false) } }
        _state.update { it.copy(examId = exam.id, targets = listOf(PrintTarget(ALL_TARGET, allLabel, false)) + classTargets) }
        viewModelScope.launch {
            val list = (templates.templates() as? AppResult.Success)?.data.orEmpty()
            _state.update { state ->
                val default = list.firstOrNull { it.isDefault }?.id
                state.copy(templates = list, jobs = state.jobs.update(ExamPrintKind.REPORT_CARDS) { it.copy(templateId = it.templateId ?: default) })
            }
        }
        val branchId = exam.branchId ?: return
        viewModelScope.launch {
            val sections = (organisation.sections(branchId, exam.sessionId) as? AppResult.Success)?.data.orEmpty()
            val ordered = exam.classes.flatMap { c ->
                val head = PrintTarget("$CLASS_PREFIX${c.id}", classAllLabel(c.name), false)
                listOf(head) + sections.filter { it.classId == c.id }.sortedBy { it.name }
                    .map { PrintTarget("$SECTION_PREFIX${it.id}", listOfNotNull(it.className ?: c.name, it.name).joinToString(" "), true) }
            }
            _state.update { it.copy(targets = listOf(PrintTarget(ALL_TARGET, allLabel, false)) + ordered) }
        }
    }

    fun onTarget(kind: ExamPrintKind, target: String) = edit(kind) { it.copy(target = target, url = null, error = null) }

    fun onSubject(kind: ExamPrintKind, subjectId: String) = edit(kind) { it.copy(subjectId = subjectId, subjectMissing = false, url = null, error = null) }

    fun onTemplate(templateId: String) = edit(ExamPrintKind.REPORT_CARDS) { it.copy(templateId = templateId, url = null, error = null) }

    fun generate(kind: ExamPrintKind) {
        val examId = _state.value.examId ?: return
        val job = _state.value.jobs.getValue(kind)
        if (job.running) return
        if (kind == ExamPrintKind.AWARD_LIST && job.subjectId == null) return edit(kind) { it.copy(subjectMissing = true) }
        edit(kind) { it.copy(running = true, url = null, error = null) }
        val input = ExamPrintInput(
            kind = kind,
            classId = job.target.removePrefix(CLASS_PREFIX).takeIf { job.target.startsWith(CLASS_PREFIX) },
            sectionId = job.target.removePrefix(SECTION_PREFIX).takeIf { job.target.startsWith(SECTION_PREFIX) },
            subjectId = job.subjectId.takeIf { kind == ExamPrintKind.AWARD_LIST },
            templateId = job.templateId.takeIf { kind == ExamPrintKind.REPORT_CARDS },
        )
        viewModelScope.launch {
            val result = repository.print(examId, input)
            edit(kind) {
                when (result) {
                    is AppResult.Success -> it.copy(running = false, url = result.data)
                    is AppResult.Failure -> it.copy(running = false, error = result.error)
                }
            }
        }
    }

    private fun edit(kind: ExamPrintKind, transform: (PrintJob) -> PrintJob) =
        _state.update { it.copy(jobs = it.jobs.update(kind, transform)) }

    private fun Map<ExamPrintKind, PrintJob>.update(kind: ExamPrintKind, transform: (PrintJob) -> PrintJob) =
        this + (kind to transform(getValue(kind)))

    companion object {
        const val CLASS_PREFIX = "class:"
        const val SECTION_PREFIX = "section:"
    }
}

const val ALL_TARGET = "all"

/** Options for a print card; award lists and report cards can go down to a section, date sheets to a class. */
internal fun PrintState.targetOptions(withSections: Boolean): List<SwitcherOption> =
    targets.filter { withSections || !it.isSection }.map { SwitcherOption(it.id, it.label) }
