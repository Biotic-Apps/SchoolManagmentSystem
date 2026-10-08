package com.schoolapp.feature.students.manage

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.people.GuardiansRepository
import com.schoolapp.core.data.people.StudentAdminRepository
import com.schoolapp.core.model.people.EnrollmentChange
import com.schoolapp.core.model.people.LinkGuardianInput
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.model.people.PersonRules
import com.schoolapp.core.model.people.StudentUpdate
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm
import com.schoolapp.feature.students.add.SectionOptionsLoader
import com.schoolapp.feature.students.detail.StudentDetailUiState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Opens, fills and submits the profile's sheets; on success the profile reloads ([reload]) and a notice shows. */
class ManageController internal constructor(
    private val studentId: String,
    private val state: MutableStateFlow<StudentDetailUiState>,
    private val scope: CoroutineScope,
    private val admin: StudentAdminRepository,
    private val guardians: GuardiansRepository,
    private val organisation: OrganisationRepository,
    private val sections: SectionOptionsLoader,
    private val auth: AuthRepository,
    private val reload: () -> Unit,
) {
    private var searchJob: Job? = null

    fun close() = state.update { it.copy(sheet = null) }

    // --- Edit -----------------------------------------------------------------------------------

    fun openEdit() = state.update { s ->
        val detail = s.detail ?: return@update s
        if (!s.canAct) return@update s
        val parts = detail.summary.name.trim().split(' ', limit = 2)
        val form = ChildForm(
            firstName = detail.firstName ?: parts.first(),
            lastName = detail.lastName ?: parts.getOrElse(1) { "" },
            dob = detail.summary.dob.orEmpty(),
            gender = detail.summary.gender.orEmpty(),
            address = detail.address.orEmpty(),
        )
        s.copy(sheet = ManageSheet.Edit(form))
    }

    fun onEditChange(form: ChildForm) = sheet<ManageSheet.Edit> { it.copy(form = form, errors = FormErrors(), error = null) }

    fun saveEdit() {
        val sheet = state.value.sheet as? ManageSheet.Edit ?: return
        val problems = sheet.form.problems(state.value.today, prefix = "").filterKeys { it != "previousSchool" }
        if (problems.isNotEmpty()) return sheet<ManageSheet.Edit> { it.copy(errors = FormErrors(problems)) }
        val f = sheet.form
        submit<ManageSheet.Edit>(ManageNotice.SAVED, { s, errors, error -> s.copy(saving = false, errors = errors, error = error) }) {
            admin.update(studentId, StudentUpdate(f.firstName, f.lastName, f.dob, f.gender, f.bForm.ifBlank { null }, f.address))
        }
    }

    // --- Withdraw / change section / transfer ------------------------------------------------------

    fun openPlacement(kind: PlacementKind) {
        val s = state.value
        if (!s.canAct) return
        state.update { it.copy(sheet = ManageSheet.Placement(kind, effectiveDate = s.today, loadingOptions = kind != PlacementKind.WITHDRAW)) }
        if (kind == PlacementKind.WITHDRAW) return
        scope.launch {
            val options = when (kind) {
                PlacementKind.CHANGE_SECTION -> sectionTargets()
                else -> branchTargets()
            }
            sheet<ManageSheet.Placement> { it.copy(options = options, loadingOptions = false) }
        }
    }

    fun onTarget(id: String) = sheet<ManageSheet.Placement> { it.copy(targetId = id, errors = it.errors.without(TARGET)) }

    fun onEffectiveDate(date: String) = sheet<ManageSheet.Placement> { it.copy(effectiveDate = date, errors = it.errors.without(DATE)) }

    fun onReason(reason: String) = sheet<ManageSheet.Placement> { it.copy(reason = reason, errors = it.errors.without(REASON), error = null) }

    fun savePlacement() {
        val sheet = state.value.sheet as? ManageSheet.Placement ?: return
        val problems = buildMap<String, PersonProblem> {
            if (sheet.kind != PlacementKind.WITHDRAW && sheet.targetId == null) put(TARGET, PersonProblem.REQUIRED)
            PersonRules.date(sheet.effectiveDate)?.let { put(DATE, it) }
            PersonRules.reason(sheet.reason)?.let { put(REASON, it) }
        }
        if (problems.isNotEmpty()) return sheet<ManageSheet.Placement> { it.copy(errors = FormErrors(problems)) }
        val change = when (sheet.kind) {
            PlacementKind.WITHDRAW -> EnrollmentChange.Withdraw(sheet.effectiveDate, sheet.reason)
            PlacementKind.CHANGE_SECTION -> EnrollmentChange.ChangeSection(sheet.targetId!!, sheet.effectiveDate, sheet.reason)
            PlacementKind.TRANSFER -> EnrollmentChange.Transfer(sheet.targetId!!, sheet.effectiveDate, sheet.reason)
        }
        val notice = when (sheet.kind) {
            PlacementKind.WITHDRAW -> ManageNotice.WITHDRAWN
            PlacementKind.CHANGE_SECTION -> ManageNotice.SECTION_CHANGED
            PlacementKind.TRANSFER -> ManageNotice.TRANSFER_REQUESTED
        }
        submit<ManageSheet.Placement>(notice, { s, errors, error -> s.copy(saving = false, errors = errors, error = error) }) {
            admin.changeEnrollment(studentId, change)
        }
    }

    private suspend fun sectionTargets(): List<TargetOption> {
        val session = auth.session.filterNotNull().first()
        val enrollment = state.value.detail?.enrollment
        val loaded = (sections.load(session, enrollment?.branchId) as? AppResult.Success)?.data ?: return emptyList()
        val current = enrollment?.sectionId ?: state.value.detail?.summary?.sectionId
        return loaded.sections.filter { it.id != current }.map { section ->
            TargetOption(section.id, section.label, section.capacity?.let { "${section.studentCount}/$it" })
        }
    }

    private suspend fun branchTargets(): List<TargetOption> {
        val current = state.value.detail?.enrollment?.branchId
        val branches = (organisation.branches() as? AppResult.Success)?.data.orEmpty()
        return branches.filter { it.id != current && (it.status == null || it.status == "ACTIVE") }.map { TargetOption(it.id, it.name) }
    }

    // --- Guardians ---------------------------------------------------------------------------------

    fun openAddGuardian() {
        if (!state.value.canLinkGuardian) return
        state.update { it.copy(sheet = ManageSheet.AddGuardian()) }
        search("")
    }

    fun setExistingMode(existing: Boolean) = sheet<ManageSheet.AddGuardian> { it.copy(existing = existing, errors = FormErrors(), error = null) }

    fun search(query: String) {
        sheet<ManageSheet.AddGuardian> { it.copy(query = query) }
        searchJob?.cancel()
        searchJob = scope.launch {
            if (query.isNotBlank()) delay(SEARCH_DEBOUNCE)
            val linked = state.value.detail?.guardians?.map { it.guardian.id }.orEmpty().toSet()
            val found = (guardians.guardians(query.trim().ifBlank { null }) as? AppResult.Success)?.data.orEmpty()
            sheet<ManageSheet.AddGuardian> { it.copy(results = found.filter { g -> g.id !in linked }) }
        }
    }

    fun selectGuardian(id: String) = sheet<ManageSheet.AddGuardian> { sheet ->
        val relation = sheet.results.firstOrNull { it.id == id }?.relation.orEmpty()
        sheet.copy(selectedId = id, relation = sheet.relation.ifBlank { relation }, errors = sheet.errors.without(GUARDIAN))
    }

    fun onLinkRelation(relation: String) = sheet<ManageSheet.AddGuardian> { it.copy(relation = relation, errors = it.errors.without(RELATION)) }

    fun onLinkPrimary(primary: Boolean) = sheet<ManageSheet.AddGuardian> { it.copy(isPrimary = primary) }

    fun onNewGuardian(form: GuardianForm) = sheet<ManageSheet.AddGuardian> { it.copy(form = form, relation = form.relation, errors = FormErrors(), error = null) }

    fun saveLink() {
        val sheet = state.value.sheet as? ManageSheet.AddGuardian ?: return
        val problems = if (sheet.existing) {
            buildMap {
                if (sheet.selectedId == null) put(GUARDIAN, PersonProblem.REQUIRED)
                if (sheet.relation.isBlank()) put(RELATION, PersonProblem.REQUIRED)
            }
        } else {
            sheet.form.problems("guardian.")
        }
        if (problems.isNotEmpty()) return sheet<ManageSheet.AddGuardian> { it.copy(errors = FormErrors(problems)) }
        val input = if (sheet.existing) {
            LinkGuardianInput(sheet.relation, sheet.isPrimary, guardianId = sheet.selectedId)
        } else {
            LinkGuardianInput(sheet.form.relation, sheet.isPrimary, guardian = sheet.form.toInput())
        }
        submit<ManageSheet.AddGuardian>(ManageNotice.GUARDIAN_LINKED, { s, errors, error -> s.copy(saving = false, errors = errors, error = error) }) {
            admin.linkGuardian(studentId, input)
        }
    }

    fun openEditGuardian(guardianId: String) = state.update { s ->
        val guardian = s.detail?.guardians?.firstOrNull { it.guardian.id == guardianId }?.guardian
        if (!s.canEditGuardians || guardian == null) s else s.copy(sheet = ManageSheet.EditGuardian(guardianId, GuardianForm.from(guardian)))
    }

    fun onGuardianEdit(form: GuardianForm) = sheet<ManageSheet.EditGuardian> { it.copy(form = form, errors = FormErrors(), error = null) }

    fun saveGuardian() {
        val sheet = state.value.sheet as? ManageSheet.EditGuardian ?: return
        val problems = sheet.form.problems("")
        if (problems.isNotEmpty()) return sheet<ManageSheet.EditGuardian> { it.copy(errors = FormErrors(problems)) }
        submit<ManageSheet.EditGuardian>(ManageNotice.SAVED, { s, errors, error -> s.copy(saving = false, errors = errors, error = error) }) {
            admin.updateGuardian(sheet.guardianId, sheet.form.toInput())
        }
    }

    // --- Shared ------------------------------------------------------------------------------------

    private inline fun <reified T : ManageSheet> sheet(crossinline change: (T) -> T) =
        state.update { s -> (s.sheet as? T)?.let { s.copy(sheet = change(it)) } ?: s }

    /** Marks the sheet saving, runs [call]; success closes it with [notice], failure puts field and server errors on it. */
    private inline fun <reified T : ManageSheet> submit(
        notice: ManageNotice,
        crossinline failed: (T, FormErrors, com.schoolapp.core.data.common.ActionError?) -> T,
        crossinline call: suspend () -> AppResult<*>,
    ) {
        state.update { s -> (s.sheet as? T)?.let { s.copy(sheet = markSaving(it)) } ?: s }
        scope.launch {
            when (val result = call()) {
                is AppResult.Success -> {
                    state.update { it.copy(sheet = null, notice = notice) }
                    reload()
                }
                is AppResult.Failure -> {
                    val fields = FormErrors.fromServer(result.error)
                    val banner = result.error.toActionError().takeIf { fields.isEmpty || result.error !is AppError.Validation }
                    sheet<T> { failed(it, fields, banner) }
                }
            }
        }
    }

    private fun markSaving(sheet: ManageSheet): ManageSheet = when (sheet) {
        is ManageSheet.Edit -> sheet.copy(saving = true, error = null)
        is ManageSheet.Placement -> sheet.copy(saving = true, error = null)
        is ManageSheet.AddGuardian -> sheet.copy(saving = true, error = null)
        is ManageSheet.EditGuardian -> sheet.copy(saving = true, error = null)
    }

    companion object {
        const val TARGET = "target"
        const val DATE = "effectiveDate"
        const val REASON = "reason"
        const val GUARDIAN = "guardianId"
        const val RELATION = "relation"
        private const val SEARCH_DEBOUNCE = 300L
    }
}
