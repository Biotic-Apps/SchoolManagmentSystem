package com.schoolapp.feature.exams.skills.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.SkillItem
import com.schoolapp.core.model.exams.SkillLevel

/** Item name, the chosen level's meaning, and the level chips. */
@Composable
internal fun SkillItemRow(
    item: SkillItem,
    scale: List<SkillLevel>,
    value: Int?,
    enabled: Boolean,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxWidth().padding(vertical = 6.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(item.name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        val label = scale.firstOrNull { it.value == value }?.label
        if (label != null) Text(label, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        SkillLevelChips(scale, value, enabled, item.name, onSelect)
    }
}
