package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors

/**
 * Single-line by default. [kind] picks keyboard, capitalisation, autocorrect and autofill hint; [imeAction]
 * defaults to Next (focus moves down) — pass Done/Search/Send with [onImeAction] on the last field of a form.
 * [keyboardOptions]/[keyboardActions] override the derived values when a screen needs something special.
 */
@Composable
fun AppTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String? = null,
    errorText: String? = null,
    supportingText: String? = null,
    enabled: Boolean = true,
    singleLine: Boolean = true,
    kind: FieldKind = if (singleLine) FieldKind.Text else FieldKind.Sentence,
    imeAction: ImeAction = if (singleLine) ImeAction.Next else ImeAction.Default,
    onImeAction: (() -> Unit)? = null,
    minLines: Int = 1,
    maxLines: Int = if (singleLine) 1 else Int.MAX_VALUE,
    keyboardOptions: KeyboardOptions? = null,
    keyboardActions: KeyboardActions? = null,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    leadingIcon: (@Composable () -> Unit)? = null,
    trailingIcon: (@Composable () -> Unit)? = null,
) {
    val helper = errorText ?: supportingText
    val autofill = kind.contentType
    val defaultActions = rememberFieldKeyboardActions(onImeAction)
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .fillMaxWidth()
            .then(if (autofill != null) Modifier.semantics { contentType = autofill } else Modifier),
        label = { Text(label) },
        placeholder = placeholder?.let { { Text(it) } },
        supportingText = helper?.let { { Text(it) } },
        isError = errorText != null,
        enabled = enabled,
        singleLine = singleLine,
        minLines = minLines,
        maxLines = maxLines,
        keyboardOptions = keyboardOptions ?: kind.keyboardOptions(imeAction),
        keyboardActions = keyboardActions ?: defaultActions,
        visualTransformation = visualTransformation,
        leadingIcon = leadingIcon,
        trailingIcon = trailingIcon,
        textStyle = MaterialTheme.typography.bodyLarge,
        shape = MaterialTheme.shapes.medium,
        colors = appTextFieldColors(),
    )
}

/** One border only: neutral at rest, primary on focus, red on error. */
@Composable
internal fun appTextFieldColors(): TextFieldColors = OutlinedTextFieldDefaults.colors(
    focusedTextColor = AppColors.TextPrimary,
    unfocusedTextColor = AppColors.TextPrimary,
    disabledTextColor = AppColors.TextSecondary,
    focusedContainerColor = AppColors.Surface,
    unfocusedContainerColor = AppColors.Surface,
    disabledContainerColor = AppColors.Background,
    errorContainerColor = AppColors.Surface,
    focusedBorderColor = AppColors.Primary,
    unfocusedBorderColor = AppColors.Border,
    disabledBorderColor = AppColors.Border,
    focusedLabelColor = AppColors.Primary,
    unfocusedLabelColor = AppColors.TextSecondary,
    disabledLabelColor = AppColors.TextSecondary,
    focusedPlaceholderColor = AppColors.TextSecondary,
    unfocusedPlaceholderColor = AppColors.TextSecondary,
    focusedLeadingIconColor = AppColors.Primary,
    unfocusedLeadingIconColor = AppColors.TextSecondary,
    focusedTrailingIconColor = AppColors.TextSecondary,
    unfocusedTrailingIconColor = AppColors.TextSecondary,
    cursorColor = AppColors.Primary,
    errorBorderColor = AppColors.Error,
    errorLabelColor = AppColors.Error,
    errorCursorColor = AppColors.Error,
    errorSupportingTextColor = AppColors.Error,
    errorTrailingIconColor = AppColors.Error,
    focusedSupportingTextColor = AppColors.TextSecondary,
    unfocusedSupportingTextColor = AppColors.TextSecondary,
)

@Preview
@Composable
private fun AppTextFieldPreview() = PreviewContainer {
    AppTextField(value = "", onValueChange = {}, label = "Email or phone")
}

@Preview
@Composable
private fun AppTextFieldErrorPreview() = PreviewContainer {
    AppTextField(value = "ab", onValueChange = {}, label = "Email or phone", errorText = "Enter a valid email")
}
