package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
fun PasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    enabled: Boolean = true,
    imeAction: ImeAction = ImeAction.Done,
    onImeAction: (() -> Unit)? = null,
    kind: FieldKind = FieldKind.Password,
) {
    var visible by rememberSaveable { mutableStateOf(false) }
    AppTextField(
        value = value,
        onValueChange = onValueChange,
        label = label,
        modifier = modifier,
        errorText = errorText,
        enabled = enabled,
        kind = kind,
        imeAction = imeAction,
        onImeAction = onImeAction,
        visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
        trailingIcon = {
            IconButton(onClick = { visible = !visible }) {
                Icon(
                    imageVector = if (visible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                    contentDescription = stringResource(
                        if (visible) R.string.ds_hide_password else R.string.ds_show_password,
                    ),
                    tint = if (visible) AppColors.Primary else AppColors.TextSecondary,
                )
            }
        },
    )
}

@Preview
@Composable
private fun PasswordFieldPreview() = PreviewContainer {
    PasswordField(value = "secret123", onValueChange = {}, label = "Password")
}
