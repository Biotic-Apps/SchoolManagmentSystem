package com.schoolapp.feature.admissions.create

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.admissions.MedicalInfo
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm

@Immutable
data class ClassChoice(val id: String, val name: String)

/** Optional medical block of an application, shared with staff who care for the child. */
@Immutable
data class MedicalForm(val allergies: String = "", val conditions: String = "", val notes: String = "") {
    fun toInfo() = MedicalInfo(allergies, conditions, notes)

    companion object {
        fun from(info: MedicalInfo?) = MedicalForm(info?.allergies.orEmpty(), info?.conditions.orEmpty(), info?.notes.orEmpty())
    }
}

/**
 * The web's application form, for a new application (`admissions.add`) or editing one before a decision
 * (`admissions.edit`): class, child, one to four guardians (one primary), medical and notes.
 */
@Immutable
data class NewApplicationUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val canAdd: Boolean = false,
    /** Editing an existing application ([applicationNo] shown, class fixed). */
    val isEdit: Boolean = false,
    val applicationNo: String? = null,
    val className: String? = null,
    /** No active session in the branch: applications can't be taken. */
    val noSession: Boolean = false,
    val today: String = "",
    val classes: List<ClassChoice> = emptyList(),
    val classId: String? = null,
    val child: ChildForm = ChildForm(),
    val guardians: List<GuardianForm> = listOf(GuardianForm(isPrimary = true)),
    val medical: MedicalForm = MedicalForm(),
    val notes: String = "",
    val errors: FormErrors = FormErrors(),
    val submitting: Boolean = false,
    val submitError: ActionError? = null,
    /** New application id (create) or the edited one (edit) once saved. */
    val createdId: String? = null,
)
