package com.schoolapp.feature.progress.homework.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.feature.progress.components.homeworkStatusLabel

/** Done / Partial / Not done picker with 48dp targets; nothing selected until the teacher taps. */
@Composable
internal fun HomeworkStatusSegment(
    selected: HomeworkStatus?,
    studentName: String,
    onSelect: (HomeworkStatus) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Row(modifier.fillMaxWidth().selectableGroup(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        HomeworkStatus.entries.forEach { status ->
            val isSelected = status == selected
            val (content, container) = status.colors()
            val shape = RoundedCornerShape(8.dp)
            val label = homeworkStatusLabel(status)
            val description = "$label, $studentName"
            Box(
                modifier = Modifier
                    .weight(1f)
                    .heightIn(min = 48.dp)
                    .background(if (isSelected) container else AppColors.Surface, shape)
                    .border(1.dp, if (isSelected) content else AppColors.Border, shape)
                    .selectable(selected = isSelected, enabled = enabled, onClick = { onSelect(status) }, role = Role.RadioButton)
                    .semantics { contentDescription = description }
                    .padding(horizontal = 4.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    label,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    color = if (isSelected) content else AppColors.TextSecondary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.clearAndSetSemantics {},
                )
            }
        }
    }
}

private fun HomeworkStatus.colors(): Pair<Color, Color> = when (this) {
    HomeworkStatus.DONE -> AppColors.Success to AppColors.SuccessContainer
    HomeworkStatus.PARTIAL -> AppColors.Warning to AppColors.WarningContainer
    HomeworkStatus.NOT_DONE -> AppColors.Error to AppColors.ErrorContainer
}
