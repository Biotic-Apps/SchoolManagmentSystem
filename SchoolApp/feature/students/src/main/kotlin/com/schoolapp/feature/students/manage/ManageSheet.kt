package com.schoolapp.feature.students.manage

import androidx.compose.runtime.Immutable
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm

/** A choice in a placement sheet (target section or branch). */
@Immutable
data class TargetOption(val id: String, val label: String, val supporting: String? = null)

enum class PlacementKind { WITHDRAW, CHANGE_SECTION, TRANSFER }

/** The one open sheet on a student's profile. Every sheet keeps its own field errors and server error. */
sealed interface ManageSheet {
    val saving: Boolean
    val errors: FormErrors
    val error: ActionError?

    /** Edit name, date of birth, gender, B-Form (blank = keep the stored one) and address. */
    @Immutable
    data class Edit(
        val form: ChildForm,
        override val saving: Boolean = false,
        override val errors: FormErrors = FormErrors(),
        override val error: ActionError? = null,
    ) : ManageSheet

    /** Withdraw, change section or transfer: target (not for withdraw), effective date and a reason. */
    @Immutable
    data class Placement(
        val kind: PlacementKind,
        val options: List<TargetOption> = emptyList(),
        val loadingOptions: Boolean = false,
        val targetId: String? = null,
        val effectiveDate: String = "",
        val reason: String = "",
        override val saving: Boolean = false,
        override val errors: FormErrors = FormErrors(),
        override val error: ActionError? = null,
    ) : ManageSheet

    /** Link a guardian of the branch, or create a new one, to this student. */
    @Immutable
    data class AddGuardian(
        val existing: Boolean = true,
        val query: String = "",
        val results: List<Guardian> = emptyList(),
        val selectedId: String? = null,
        val relation: String = "",
        val isPrimary: Boolean = false,
        val form: GuardianForm = GuardianForm(),
        override val saving: Boolean = false,
        override val errors: FormErrors = FormErrors(),
        override val error: ActionError? = null,
    ) : ManageSheet

    /** Edit a linked guardian's contact details (`guardians.edit`). */
    @Immutable
    data class EditGuardian(
        val guardianId: String,
        val form: GuardianForm,
        override val saving: Boolean = false,
        override val errors: FormErrors = FormErrors(),
        override val error: ActionError? = null,
    ) : ManageSheet
}

enum class ManageNotice { SAVED, WITHDRAWN, SECTION_CHANGED, TRANSFER_REQUESTED, GUARDIAN_LINKED }
