package com.schoolapp.feature.exams.promotions

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.data.exams.admin.JobFileWaiter
import com.schoolapp.core.data.exams.promotions.PromotionsRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.promotions.PromotionDecision
import com.schoolapp.core.model.exams.promotions.PromotionRow
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate

/** Suggest / override / confirm / apply sheets of [PromotionsViewModel]; [reload] refreshes the rows quietly. */
internal class PromotionActions(
    private val scope: CoroutineScope,
    private val state: MutableStateFlow<PromotionsState>,
    private val repository: PromotionsRepository,
    private val organisation: OrganisationRepository,
    private val exams: ExamsRepository,
    private val reload: () -> Unit,
) {
    fun openSuggest() {
        val current = state.value
        val branchId = current.branchId ?: return
        val from = current.fromSessionId ?: return
        state.update { it.copy(suggest = SuggestForm(), message = null) }
        scope.launch {
            val list = (exams.exams(status = ExamStatus.PUBLISHED, branchId = branchId) as? AppResult.Success)?.data.orEmpty()
                .filter { it.sessionId == null || it.sessionId == from }
            editSuggest { it.copy(exams = list, examsLoading = false, examIds = list.map { e -> e.id }.toSet()) }
        }
    }

    fun onToSession(id: String) = state.update { it.copy(toSessionId = id, suggest = it.suggest?.copy(toMissing = false)) }

    fun toggleExam(id: String) = editSuggest { it.copy(examIds = if (id in it.examIds) it.examIds - id else it.examIds + id, examsMissing = false) }

    fun dismissSuggest() = state.update { if (it.suggest?.running == true) it else it.copy(suggest = null) }

    fun submitSuggest() {
        val current = state.value
        val form = current.suggest ?: return
        val branchId = current.branchId ?: return
        val from = current.fromSessionId ?: return
        val to = current.toSessionId?.takeIf { it != from }
        if (to == null || form.examIds.isEmpty()) return editSuggest { it.copy(toMissing = to == null, examsMissing = it.examIds.isEmpty()) }
        editSuggest { it.copy(running = true, error = null) }
        scope.launch {
            when (val result = repository.suggestAndWait(branchId, from, to, form.examIds.toList())) {
                is AppResult.Success -> finish(PromotionMessage.Suggested) { it.copy(suggest = null) }
                is AppResult.Failure -> if ((result.error as? AppError.Server)?.code == JobFileWaiter.CODE_NOT_READY) {
                    finish(PromotionMessage.StillRunning) { it.copy(suggest = null) }
                } else {
                    editSuggest { it.copy(running = false, error = result.error) }
                }
            }
        }
    }

    fun openOverride(row: PromotionRow) {
        state.update { it.copy(override = OverrideForm(row), message = null) }
        loadSections(row, row.decision)
    }

    fun onDecision(decision: PromotionDecision) {
        val form = state.value.override ?: return
        editOverride { it.copy(decision = decision, sectionId = null, sections = emptyList(), reasonMissing = false) }
        loadSections(form.row, decision)
    }

    fun onSection(id: String) = editOverride { it.copy(sectionId = id) }

    fun onReason(text: String) = editOverride { it.copy(reason = text.take(REASON_MAX), reasonMissing = false) }

    fun dismissOverride() = state.update { if (it.override?.isSaving == true) it else it.copy(override = null) }

    fun submitOverride() {
        val form = state.value.override ?: return
        if (form.isSaving) return
        if (form.needsReason && form.reason.trim().length < REASON_MIN) return editOverride { it.copy(reasonMissing = true) }
        editOverride { it.copy(isSaving = true, error = null) }
        scope.launch {
            val section = form.sectionId.takeIf { form.decision != PromotionDecision.GRADUATE }
            when (val result = repository.override(form.row.id, form.decision, section, form.reason.takeIf { it.isNotBlank() })) {
                is AppResult.Failure -> editOverride { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> state.update { current ->
                    current.copy(
                        override = null,
                        rows = current.rows.map { if (it.id == result.data.id) result.data else it },
                        message = PromotionMessage.Updated,
                    )
                }
            }
        }
    }

    fun openConfirm() = state.update { it.copy(confirm = ConfirmForm(classId = it.classFilter), message = null) }

    fun onConfirmClass(id: String?) = state.update { it.copy(confirm = it.confirm?.copy(classId = id)) }

    fun dismissConfirm() = state.update { if (it.confirm?.isSaving == true) it else it.copy(confirm = null) }

    fun submitConfirm() {
        val current = state.value
        val form = current.confirm ?: return
        val branchId = current.branchId ?: return
        val from = current.fromSessionId ?: return
        state.update { it.copy(confirm = form.copy(isSaving = true, error = null)) }
        scope.launch {
            when (val result = repository.confirm(branchId, from, form.classId)) {
                is AppResult.Success -> finish(PromotionMessage.Confirmed(result.data)) { it.copy(confirm = null) }
                is AppResult.Failure -> state.update { it.copy(confirm = it.confirm?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    fun openApply() = state.update { it.copy(apply = ApplyForm(LocalDate.now().toString()), message = null) }

    fun onApplyDate(date: String) = state.update { it.copy(apply = it.apply?.copy(effectiveDate = date)) }

    fun dismissApply() = state.update { if (it.apply?.isSaving == true) it else it.copy(apply = null) }

    fun submitApply() {
        val current = state.value
        val form = current.apply ?: return
        val branchId = current.branchId ?: return
        val from = current.fromSessionId ?: return
        state.update { it.copy(apply = form.copy(isSaving = true, error = null)) }
        scope.launch {
            when (val result = repository.apply(branchId, from, form.effectiveDate)) {
                is AppResult.Success -> finish(PromotionMessage.Applied(result.data.applied, result.data.skipped)) { it.copy(apply = null) }
                is AppResult.Failure -> state.update { it.copy(apply = it.apply?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    /** Sections of the class the student sits in next session (repeaters keep their class). */
    private fun loadSections(row: PromotionRow, decision: PromotionDecision) {
        val current = state.value
        val branchId = current.branchId ?: return
        val to = current.toSessionId ?: return
        val classId = (if (decision == PromotionDecision.REPEAT) row.fromClass?.id else row.toClass?.id) ?: return
        if (decision == PromotionDecision.GRADUATE) return
        scope.launch {
            val sections = (organisation.sections(branchId, to) as? AppResult.Success)?.data.orEmpty()
                .filter { it.classId == classId }.map { PersonRef(it.id, listOfNotNull(it.className, it.name).joinToString(" ")) }
            editOverride { form -> if (form.row.id == row.id && form.decision == decision) form.copy(sections = sections) else form }
        }
    }

    private fun finish(message: PromotionMessage, close: (PromotionsState) -> PromotionsState) {
        state.update { close(it).copy(message = message) }
        reload()
    }

    private fun editSuggest(transform: (SuggestForm) -> SuggestForm) =
        state.update { current -> current.suggest?.let { current.copy(suggest = transform(it)) } ?: current }

    private fun editOverride(transform: (OverrideForm) -> OverrideForm) =
        state.update { current -> current.override?.let { current.copy(override = transform(it)) } ?: current }

    private companion object {
        const val REASON_MIN = 3
        const val REASON_MAX = 1000
    }
}
