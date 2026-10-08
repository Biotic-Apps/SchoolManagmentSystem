package com.schoolapp.feature.staff.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.staff.R

/** Personal and job fields shared by the add and edit staff screens. */
@Composable
internal fun StaffFormFields(
    form: StaffForm,
    errors: Map<StaffField, FieldProblem>,
    enabled: Boolean,
    onChange: (StaffForm) -> Unit,
    modifier: Modifier = Modifier,
    cnicHint: String? = null,
    contactHint: String? = null,
) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AppTextField(
            value = form.name,
            onValueChange = { onChange(form.copy(name = it)) },
            label = stringResource(R.string.staff_field_name),
            kind = FieldKind.Name,
            enabled = enabled,
            errorText = problemText(errors[StaffField.NAME]),
        )
        AppTextField(
            value = form.email,
            onValueChange = { onChange(form.copy(email = it)) },
            label = stringResource(R.string.staff_field_email),
            kind = FieldKind.Email,
            enabled = enabled,
            errorText = problemText(errors[StaffField.EMAIL]),
            supportingText = contactHint,
        )
        AppTextField(
            value = form.phone,
            onValueChange = { onChange(form.copy(phone = it)) },
            label = stringResource(R.string.staff_field_phone),
            kind = FieldKind.Phone,
            enabled = enabled,
            placeholder = stringResource(R.string.staff_phone_placeholder),
            errorText = problemText(errors[StaffField.PHONE]),
        )
        OptionPickerField(
            label = stringResource(R.string.staff_field_type),
            options = designationOptions(),
            selectedId = form.designation,
            onSelect = { onChange(form.copy(designation = it)) },
            enabled = enabled,
            errorText = problemText(errors[StaffField.DESIGNATION]),
        )
        PickerField(
            value = formatDate(form.joinDate).orEmpty(),
            label = stringResource(R.string.staff_field_join_date),
            onClick = { pickDate = true },
            enabled = enabled,
            errorText = problemText(errors[StaffField.JOIN_DATE]),
        )
        AppTextField(
            value = form.employeeNo,
            onValueChange = { onChange(form.copy(employeeNo = it)) },
            label = stringResource(R.string.staff_field_employee_no),
            kind = FieldKind.Code,
            enabled = enabled,
            errorText = problemText(errors[StaffField.EMPLOYEE_NO]),
        )
        AppTextField(
            value = form.cnic,
            onValueChange = { onChange(form.copy(cnic = it)) },
            label = stringResource(R.string.staff_field_cnic),
            kind = FieldKind.Phone,
            enabled = enabled,
            placeholder = stringResource(R.string.staff_cnic_placeholder),
            supportingText = cnicHint,
            errorText = problemText(errors[StaffField.CNIC]),
        )
        AppTextField(
            value = form.qualification,
            onValueChange = { onChange(form.copy(qualification = it)) },
            label = stringResource(R.string.staff_field_qualification),
            kind = FieldKind.Title,
            enabled = enabled,
            imeAction = ImeAction.Done,
            placeholder = stringResource(R.string.staff_qualification_placeholder),
            errorText = problemText(errors[StaffField.QUALIFICATION]),
        )
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = form.joinDate,
            onConfirm = {
                pickDate = false
                onChange(form.copy(joinDate = it))
            },
            onDismiss = { pickDate = false },
        )
    }
}
