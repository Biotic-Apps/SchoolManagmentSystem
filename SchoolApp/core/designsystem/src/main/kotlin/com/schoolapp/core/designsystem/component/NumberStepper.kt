package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

/**
 * "−  6  +" for small whole numbers (periods per week, seats). A null [value] shows "—" (not set); the
 * first + from null starts at [min]. [label] names the value for TalkBack ("English periods per week").
 */
@Composable
fun NumberStepper(
    value: Int?,
    onValueChange: (Int) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    min: Int = 0,
    max: Int = 99,
    step: Int = 1,
    enabled: Boolean = true,
) {
    Surface(
        modifier = modifier.semantics { stateDescription = value?.toString() ?: "-" },
        shape = MaterialTheme.shapes.small,
        color = AppColors.Surface,
        border = BorderStroke(1.dp, AppColors.Border),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            val less = stringResource(R.string.ds_decrease, label)
            val more = stringResource(R.string.ds_increase, label)
            IconButton(
                onClick = { onValueChange(((value ?: min) - step).coerceIn(min, max)) },
                enabled = enabled && value != null && value > min,
                modifier = Modifier.size(40.dp).semantics { contentDescription = less },
            ) { Icon(Icons.Outlined.Remove, contentDescription = null) }
            Text(
                text = value?.toString() ?: "—",
                style = MaterialTheme.typography.titleMedium,
                color = if (value == null) AppColors.TextSecondary else AppColors.TextPrimary,
                textAlign = TextAlign.Center,
                modifier = Modifier.defaultMinSize(minWidth = 28.dp),
            )
            IconButton(
                onClick = { onValueChange(if (value == null) min.coerceAtLeast(step) else (value + step).coerceIn(min, max)) },
                enabled = enabled && (value == null || value < max),
                modifier = Modifier.size(40.dp).semantics { contentDescription = more },
            ) { Icon(Icons.Outlined.Add, contentDescription = null) }
        }
    }
}

@Preview
@Composable
private fun NumberStepperPreview() = PreviewContainer {
    NumberStepper(value = 6, onValueChange = {}, label = "Periods per week")
}
