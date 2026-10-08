package com.schoolapp.feature.staff.add

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.CreatedStaff
import com.schoolapp.core.model.staff.StaffOptions
import com.schoolapp.feature.staff.form.FieldProblem
import com.schoolapp.feature.staff.form.StaffField
import com.schoolapp.feature.staff.form.StaffForm

@Immutable
data class AddStaffUiState(
    val isLoading: Boolean = true,
    val canAdd: Boolean = false,
    val loadError: AppError? = null,
    /** Only filled when the active role has no branch of its own (super admin) and must pick one. */
    val branchOptions: List<SwitcherOption> = emptyList(),
    val branchId: String? = null,
    val form: StaffForm = StaffForm(),
    val createAccount: Boolean = true,
    /** Chosen sign-in role; null follows the staff type (same default as the API). */
    val chosenRole: String? = null,
    val errors: Map<StaffField, FieldProblem> = emptyMap(),
    val error: AppError? = null,
    val isSaving: Boolean = false,
    val created: CreatedStaff? = null,
) {
    val roleKey: String get() = chosenRole ?: StaffOptions.defaultRoleFor(form.designation)

    val needsBranchPick: Boolean get() = branchOptions.size > 1

    /** Temporary password (or "linked to an existing login" note) must be seen before moving on. */
    val showCredentials: Boolean get() = created != null && createAccount

    /** Teachers go on to the optional "Assign classes" step; other staff straight to their profile. */
    val offerAssign: Boolean get() = form.designation in StaffOptions.TEACHING_DESIGNATIONS
}
