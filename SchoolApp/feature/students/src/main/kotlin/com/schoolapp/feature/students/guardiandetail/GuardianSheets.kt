package com.schoolapp.feature.students.guardiandetail

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.toActionError
import com.schoolapp.core.data.guardians.GuardianAdminRepository
import com.schoolapp.core.data.people.StudentAdminRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.guardians.GuardianChild
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Edit-guardian and unlink-child sheets of the guardian page; success closes the sheet, reloads and shows a notice. */
class GuardianSheets @Inject constructor(
    private val admin: StudentAdminRepository,
    private val guardians: GuardianAdminRepository,
    private val students: StudentsRepository,
) {
    private lateinit var guardianId: String
    private lateinit var state: MutableStateFlow<GuardianDetailUiState>
    private lateinit var scope: CoroutineScope
    private lateinit var reload: () -> Unit

    internal fun bind(id: String, state: MutableStateFlow<GuardianDetailUiState>, scope: CoroutineScope, reload: () -> Unit) {
        guardianId = id
        this.state = state
        this.scope = scope
        this.reload = reload
    }

    fun close() = state.update { if (it.sheet.isSaving()) it else it.copy(sheet = null) }

    fun openEdit() = state.update { s ->
        val guardian = s.detail?.guardian
        if (!s.canEdit || guardian == null) s else s.copy(sheet = GuardianSheet.Edit(GuardianForm.from(guardian)))
    }

    fun onEdit(form: GuardianForm) = edit { it.copy(form = form, errors = FormErrors(), error = null) }

    fun saveEdit() {
        val sheet = state.value.sheet as? GuardianSheet.Edit ?: return
        val problems = sheet.form.problems("")
        if (problems.isNotEmpty()) return edit { it.copy(errors = FormErrors(problems)) }
        edit { it.copy(saving = true, error = null) }
        scope.launch {
            when (val result = admin.updateGuardian(guardianId, sheet.form.toInput())) {
                is AppResult.Success -> done(GuardianNotice.Saved)
                is AppResult.Failure -> {
                    val fields = FormErrors.fromServer(result.error)
                    val banner = result.error.toActionError().takeIf { fields.isEmpty || result.error !is AppError.Validation }
                    edit { it.copy(saving = false, errors = fields, error = banner) }
                }
            }
        }
    }

    fun openUnlink(child: GuardianChild) = state.update { s ->
        if (!s.canEdit) s else s.copy(sheet = GuardianSheet.Unlink(child))
    }

    fun onUnlinkReason(reason: String) = unlink { it.copy(reason = reason.take(REASON_MAX), reasonError = false, error = null) }

    fun confirmUnlink() {
        val sheet = state.value.sheet as? GuardianSheet.Unlink ?: return
        if (sheet.reason.trim().length < REASON_MIN) return unlink { it.copy(reasonError = true) }
        unlink { it.copy(saving = true, error = null) }
        scope.launch {
            val linkId = sheet.child.linkId ?: resolveLinkId(sheet.child.studentId)
            val result = if (linkId == null) {
                AppResult.Failure(AppError.Server(HTTP_NOT_FOUND, "NOT_FOUND", null))
            } else {
                guardians.unlink(sheet.child.studentId, linkId, sheet.reason)
            }
            when (result) {
                is AppResult.Success -> done(GuardianNotice.Unlinked)
                is AppResult.Failure -> unlink { it.copy(saving = false, error = result.error.toActionError()) }
            }
        }
    }

    /** Older servers leave `linkId` out of the guardian's children; find it on the student. */
    private suspend fun resolveLinkId(studentId: String): String? =
        (students.student(studentId) as? AppResult.Success)?.data?.guardians
            ?.firstOrNull { it.guardian.id == guardianId && it.status != "REVOKED" }?.id

    private fun done(notice: GuardianNotice) {
        state.update { it.copy(sheet = null, notice = notice) }
        reload()
    }

    private fun edit(change: (GuardianSheet.Edit) -> GuardianSheet.Edit) =
        state.update { s -> (s.sheet as? GuardianSheet.Edit)?.let { s.copy(sheet = change(it)) } ?: s }

    private fun unlink(change: (GuardianSheet.Unlink) -> GuardianSheet.Unlink) =
        state.update { s -> (s.sheet as? GuardianSheet.Unlink)?.let { s.copy(sheet = change(it)) } ?: s }

    private fun GuardianSheet?.isSaving() = when (this) {
        is GuardianSheet.Edit -> saving
        is GuardianSheet.Unlink -> saving
        null -> false
    }

    private companion object {
        const val REASON_MIN = 3
        const val REASON_MAX = 500
        const val HTTP_NOT_FOUND = 404
    }
}
