package com.schoolapp.feature.expenses.vendors

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.expenses.R

/** "Add vendor": name (required), contact person, phone, email, NTN and address. */
@Composable
internal fun VendorFormSheet(
    form: VendorFormState,
    onChange: ((VendorFormState) -> VendorFormState) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.expenses_add_vendor), onDismiss = onDismiss) {
        form.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        AppTextField(
            value = form.name,
            onValueChange = { v -> onChange { it.copy(name = v, errors = it.errors - VendorField.NAME) } },
            label = stringResource(R.string.expenses_vendor_name),
            kind = FieldKind.Title,
            errorText = vendorErrorText(form.errors[VendorField.NAME]),
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = form.contactPerson,
            onValueChange = { v -> onChange { it.copy(contactPerson = v, errors = it.errors - VendorField.CONTACT) } },
            label = stringResource(R.string.expenses_vendor_contact),
            kind = FieldKind.Name,
            errorText = vendorErrorText(form.errors[VendorField.CONTACT]),
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = form.phone,
            onValueChange = { v -> onChange { it.copy(phone = v, errors = it.errors - VendorField.PHONE) } },
            label = stringResource(R.string.expenses_vendor_phone),
            kind = FieldKind.Phone,
            errorText = vendorErrorText(form.errors[VendorField.PHONE]),
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = form.email,
            onValueChange = { v -> onChange { it.copy(email = v, errors = it.errors - VendorField.EMAIL) } },
            label = stringResource(R.string.expenses_vendor_email),
            kind = FieldKind.Email,
            errorText = vendorErrorText(form.errors[VendorField.EMAIL]),
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextField(
            value = form.ntn,
            onValueChange = { v -> onChange { it.copy(ntn = v, errors = it.errors - VendorField.NTN) } },
            label = stringResource(R.string.expenses_vendor_ntn),
            kind = FieldKind.Code,
            supportingText = stringResource(R.string.expenses_vendor_ntn_hint),
            errorText = vendorErrorText(form.errors[VendorField.NTN]),
            imeAction = ImeAction.Next,
            modifier = Modifier.fillMaxWidth(),
        )
        AppTextArea(
            value = form.address,
            onValueChange = { v -> onChange { it.copy(address = v, errors = it.errors - VendorField.ADDRESS) } },
            label = stringResource(R.string.expenses_vendor_address),
            errorText = vendorErrorText(form.errors[VendorField.ADDRESS]),
            minLines = 2,
            maxLines = 4,
            modifier = Modifier.fillMaxWidth(),
        )
        PrimaryButton(
            text = stringResource(R.string.expenses_add_vendor),
            onClick = onSave,
            loading = form.isSaving,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun vendorErrorText(error: VendorError?): String? = when (error) {
    null -> null
    VendorError.REQUIRED -> stringResource(R.string.expenses_error_vendor_name)
    VendorError.TOO_SHORT -> stringResource(R.string.expenses_error_too_short, VendorFormState.MIN_NAME)
    VendorError.TOO_LONG -> stringResource(R.string.expenses_error_too_long)
    VendorError.INVALID_PHONE -> stringResource(R.string.expenses_error_phone)
    VendorError.INVALID_EMAIL -> stringResource(R.string.expenses_error_email)
}
