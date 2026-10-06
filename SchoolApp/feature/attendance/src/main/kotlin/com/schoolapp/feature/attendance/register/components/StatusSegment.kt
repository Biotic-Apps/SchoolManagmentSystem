package com.schoolapp.feature.attendance.register.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.feature.attendance.components.attendanceStatusLabel
import com.schoolapp.feature.attendance.components.attendanceStatusShort
import com.schoolapp.feature.attendance.components.tone
import com.schoolapp.feature.attendance.components.toneColors

/** P / A / L / Lv / ½ picker with 48dp targets; screen readers hear the full status words. */
@Composable
internal fun StatusSegment(
    selected: AttendanceStatus?,
    studentName: String,
    onSelect: (AttendanceStatus) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier.fillMaxWidth().selectableGroup(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        AttendanceStatus.entries.forEach { status ->
            val isSelected = status == selected
            val colors = status.tone().toneColors()
            val shape = RoundedCornerShape(8.dp)
            val description = "${attendanceStatusLabel(status)}, $studentName"
            Box(
                modifier = Modifier
                    .weight(1f)
                    .heightIn(min = 48.dp)
                    .background(if (isSelected) colors.container else AppColors.Surface, shape)
                    .border(1.dp, if (isSelected) colors.content else AppColors.Border, shape)
                    .selectable(selected = isSelected, onClick = { onSelect(status) }, role = Role.RadioButton)
                    .semantics { contentDescription = description },
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    attendanceStatusShort(status),
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    color = if (isSelected) colors.content else AppColors.TextSecondary,
                    modifier = Modifier.clearAndSetSemantics {},
                )
            }
        }
    }
}
