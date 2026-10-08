package com.schoolapp.feature.staff.form

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.staff.StaffOptions
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.roleLabel
import com.schoolapp.feature.staff.R

/** Known designation codes get a label; legacy free text is shown as stored, like the web. */
@Composable
@ReadOnlyComposable
internal fun designationLabel(key: String): String = when (key) {
    "TEACHER" -> stringResource(R.string.staff_type_teacher)
    "HELPER" -> stringResource(R.string.staff_type_helper)
    "COORDINATOR" -> stringResource(R.string.staff_type_coordinator)
    "HEAD_TEACHER" -> stringResource(R.string.staff_type_head_teacher)
    "ACCOUNTANT" -> stringResource(R.string.staff_type_accountant)
    "OFFICE_STAFF" -> stringResource(R.string.staff_type_office_staff)
    "OTHER" -> stringResource(R.string.staff_type_other)
    else -> key
}

@Composable
@ReadOnlyComposable
internal fun designationOptions(): List<SwitcherOption> = StaffOptions.DESIGNATIONS.map { SwitcherOption(it, designationLabel(it)) }

@Composable
@ReadOnlyComposable
internal fun accountRoleOptions(): List<SwitcherOption> = StaffOptions.ACCOUNT_ROLES.map { key ->
    SwitcherOption(key, RoleKey.fromKey(key)?.let { roleLabel(it) } ?: humanizeKey(key))
}

@Composable
@ReadOnlyComposable
internal fun problemText(problem: FieldProblem?): String? = when (problem) {
    null -> null
    FieldProblem.REQUIRED -> stringResource(R.string.staff_error_required)
    FieldProblem.TOO_SHORT -> stringResource(R.string.staff_error_name_short)
    FieldProblem.TOO_LONG -> stringResource(R.string.staff_error_too_long)
    FieldProblem.INVALID_EMAIL -> stringResource(R.string.staff_error_email)
    FieldProblem.INVALID_PHONE -> stringResource(R.string.staff_error_phone)
    FieldProblem.INVALID_CNIC -> stringResource(R.string.staff_error_cnic)
    FieldProblem.CONTACT_FOR_ACCOUNT -> stringResource(R.string.staff_error_contact_for_account)
    FieldProblem.EMAIL_TAKEN -> stringResource(R.string.staff_error_login_taken)
    FieldProblem.CONTACT_MISMATCH -> stringResource(R.string.staff_error_contact_mismatch)
    FieldProblem.EMPLOYEE_NO_TAKEN -> stringResource(R.string.staff_error_employee_no_taken)
}
