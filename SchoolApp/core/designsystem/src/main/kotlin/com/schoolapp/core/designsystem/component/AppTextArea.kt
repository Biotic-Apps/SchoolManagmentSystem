package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.heightIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

/** Multi-line text input (comments, notes). */
@Composable
fun AppTextArea(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    supportingText: String? = null,
    enabled: Boolean = true,
) {
    AppTextField(
        value = value,
        onValueChange = onValueChange,
        label = label,
        modifier = modifier.heightIn(min = 112.dp),
        errorText = errorText,
        supportingText = supportingText,
        enabled = enabled,
        singleLine = false,
    )
}

@Preview
@Composable
private fun AppTextAreaPreview() = PreviewContainer {
    AppTextArea(value = "", onValueChange = {}, label = "Comment")
}
