package com.schoolapp.core.designsystem.component

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview

/** Multi-line text input (comments, notes): Enter adds a new line; grows from [minLines] up to [maxLines], then scrolls. */
@Composable
fun AppTextArea(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    supportingText: String? = null,
    enabled: Boolean = true,
    minLines: Int = 3,
    maxLines: Int = 6,
) {
    AppTextField(
        value = value,
        onValueChange = onValueChange,
        label = label,
        modifier = modifier,
        errorText = errorText,
        supportingText = supportingText,
        enabled = enabled,
        singleLine = false,
        kind = FieldKind.Sentence,
        minLines = minLines,
        maxLines = maxLines,
    )
}

@Preview
@Composable
private fun AppTextAreaPreview() = PreviewContainer {
    AppTextArea(value = "", onValueChange = {}, label = "Comment")
}
