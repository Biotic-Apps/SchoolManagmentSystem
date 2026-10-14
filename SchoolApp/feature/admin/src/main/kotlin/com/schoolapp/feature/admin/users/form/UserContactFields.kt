package com.schoolapp.feature.admin.users.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.FieldProblem
import com.schoolapp.feature.admin.common.fieldProblemText

/** Full name, email and phone (create and edit user). */
@Composable
internal fun UserContactFields(
    contact: UserContact,
    onChange: (UserContact) -> Unit,
    errors: Map<UserField, FieldProblem>,
    serverErrors: Map<UserField, String>,
    modifier: Modifier = Modifier,
) {
    @Composable
    fun error(field: UserField): String? = serverErrors[field] ?: fieldProblemText(errors[field])
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AppTextField(
            value = contact.name,
            onValueChange = { onChange(contact.copy(name = it)) },
            label = stringResource(R.string.users_field_name),
            errorText = error(UserField.NAME),
            kind = FieldKind.Name,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = contact.email,
            onValueChange = { onChange(contact.copy(email = it)) },
            label = stringResource(R.string.users_field_email),
            errorText = error(UserField.EMAIL),
            kind = FieldKind.Email,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = contact.phone,
            onValueChange = { onChange(contact.copy(phone = it)) },
            label = stringResource(R.string.users_field_phone),
            placeholder = "+92 300 1234567",
            errorText = error(UserField.PHONE),
            kind = FieldKind.Phone,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
