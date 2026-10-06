package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.PressInteraction
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors

/** Read-only field that opens a picker (date, time, option) when tapped; shows the already formatted [value]. */
@Composable
fun PickerField(
    value: String,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    errorText: String? = null,
    enabled: Boolean = true,
    icon: ImageVector = Icons.Outlined.CalendarMonth,
) {
    val interaction = remember { MutableInteractionSource() }
    val currentOnClick by rememberUpdatedState(onClick)
    LaunchedEffect(interaction, enabled) {
        interaction.interactions.collect { if (enabled && it is PressInteraction.Release) currentOnClick() }
    }
    OutlinedTextField(
        value = value,
        onValueChange = {},
        readOnly = true,
        enabled = enabled,
        label = { Text(label) },
        isError = errorText != null,
        supportingText = errorText?.let { { Text(it) } },
        trailingIcon = { Icon(icon, contentDescription = null, tint = AppColors.TextSecondary) },
        interactionSource = interaction,
        singleLine = true,
        textStyle = MaterialTheme.typography.bodyLarge,
        shape = MaterialTheme.shapes.small,
        colors = appTextFieldColors(),
        modifier = modifier.fillMaxWidth(),
    )
}

@Preview
@Composable
private fun PickerFieldPreview() = PreviewContainer { PickerField(value = "5 Oct 2026", label = "Date of birth", onClick = {}) }
