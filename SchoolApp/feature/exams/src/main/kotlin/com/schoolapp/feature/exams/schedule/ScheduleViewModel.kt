package com.schoolapp.feature.exams.schedule

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.admin.ExamAdminRepository
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.admin.ExamDetail
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Date sheet editor (web use-schedule-editor): local rows over the saved papers, edited one paper at a time,
 * then saved together. Locked once marks entry opens. 409 clashes are shown on the matching rows.
 */
@HiltViewModel
class ScheduleViewModel @Inject constructor(
    private val repository: ExamAdminRepository,
    private val catalogue: CatalogueRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ScheduleState())
    val state: StateFlow<ScheduleState> = _state.asStateFlow()

    internal val editor = PaperEditor(_state)

    /** (Re)starts from [exam]'s saved papers whenever the saved version changes. */
    fun start(exam: ExamDetail) {
        val rows = ScheduleRows.fromPapers(exam.papers)
        val signature = ScheduleRows.signature(rows)
        val current = _state.value
        if (current.examId == exam.id && current.savedSignature == signature && current.isDraftExam == (exam.status == ExamStatus.DRAFT)) return
        val firstStart = current.examId != exam.id
        val names = exam.papers.associate { it.classId to it.className } + exam.classes.mapNotNull { c -> c.id?.let { it to c.name } }
        _state.update {
            it.copy(
                examId = exam.id,
                rows = rows,
                savedSignature = signature,
                classIds = exam.classIds.ifEmpty { exam.papers.map { p -> p.classId }.distinct() },
                classNames = names.filterValues { name -> name.isNotBlank() },
                isDraftExam = exam.status == ExamStatus.DRAFT,
                readOnly = !it.canEdit || exam.status >= ExamStatus.MARKS_OPEN,
                rowProblems = emptyMap(), rowClashes = emptyMap(), generalErrors = emptyList(), noPapers = false,
            )
        }
        if (firstStart) loadOptions(exam)
    }

    fun requestRemove(key: String) = _state.update { it.copy(confirmRemoveKey = key) }

    fun dismissRemove() = _state.update { it.copy(confirmRemoveKey = null) }

    fun confirmRemove() = _state.update { state ->
        val key = state.confirmRemoveKey ?: return@update state
        state.copy(rows = state.rows.filterNot { it.key == key }, confirmRemoveKey = null, rowProblems = state.rowProblems - key, saved = false)
    }

    fun requestDiscard() = _state.update { it.copy(confirmDiscard = true) }

    fun dismissDiscard() = _state.update { it.copy(confirmDiscard = false) }

    fun discard(exam: ExamDetail) {
        _state.update { it.copy(examId = null, confirmDiscard = false) }
        start(exam)
    }

    fun save(onExamChanged: (ExamDetail) -> Unit) {
        val state = _state.value
        val examId = state.examId ?: return
        if (state.isSaving || !state.canSave) return
        val problems = state.rows.associate { it.key to ScheduleRows.problems(it, state.rows) }.filterValues { it.isNotEmpty() }
        if (problems.isNotEmpty() || state.rows.isEmpty()) {
            return _state.update { it.copy(rowProblems = problems, noPapers = state.rows.isEmpty(), rowClashes = emptyMap(), generalErrors = emptyList()) }
        }
        _state.update { it.copy(isSaving = true, saveError = null, rowProblems = emptyMap(), rowClashes = emptyMap(), generalErrors = emptyList(), saved = false) }
        viewModelScope.launch {
            when (val result = repository.saveSchedule(examId, ScheduleRows.toInputs(state.rows))) {
                is AppResult.Success -> {
                    _state.update { it.copy(isSaving = false, saved = true) }
                    onExamChanged(result.data)
                }
                is AppResult.Failure -> {
                    val clashes = repository.conflicts(result.error)
                    if (clashes.isEmpty()) return@launch _state.update { it.copy(isSaving = false, saveError = result.error) }
                    val byRow = mutableMapOf<String, List<String>>()
                    val general = mutableListOf<String>()
                    clashes.forEach { clash ->
                        val keys = ScheduleRows.rowsForClash(clash, state.rows)
                        if (keys.isEmpty()) general += clash.label
                        keys.forEach { key -> byRow[key] = byRow[key].orEmpty() + clash.label }
                    }
                    _state.update { it.copy(isSaving = false, rowClashes = byRow, generalErrors = general) }
                }
            }
        }
    }

    private fun loadOptions(exam: ExamDetail) {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canEdit = session.has(EDIT_PERMISSION)
            _state.update { it.copy(canEdit = canEdit, readOnly = !canEdit || exam.status >= ExamStatus.MARKS_OPEN) }
        }
        exam.branchId?.let { branchId ->
            viewModelScope.launch {
                val rooms = (catalogue.rooms(branchId) as? AppResult.Success)?.data.orEmpty()
                _state.update { it.copy(rooms = rooms.map { room -> PersonRef(room.id, room.name) }) }
            }
        }
        exam.classIds.forEach { classId ->
            viewModelScope.launch {
                val subjects = (repository.classSubjects(classId) as? AppResult.Success)?.data
                    ?: exam.papers.filter { it.classId == classId }.map { PersonRef(it.subjectId, it.subjectName) }
                _state.update { it.copy(subjects = it.subjects + (classId to subjects)) }
            }
        }
    }

    private companion object {
        const val EDIT_PERMISSION = "exams.edit"
    }
}
