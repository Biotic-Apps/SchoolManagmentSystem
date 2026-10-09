package com.schoolapp.feature.exams.skills.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.SkillLevel

/** One chip per level code (best first); the selected one is highlighted. */
@Composable
internal fun SkillLevelChips(
    scale: List<SkillLevel>,
    selected: Int?,
    enabled: Boolean,
    itemName: String,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        scale.forEach { level ->
            FilterChip(
                selected = level.value == selected,
                onClick = { onSelect(level.value) },
                enabled = enabled,
                label = { Text(level.code, textAlign = TextAlign.Center, modifier = Modifier.widthIn(min = 14.dp)) },
                modifier = Modifier.semantics { contentDescription = "$itemName: ${level.label}" },
                colors = FilterChipDefaults.filterChipColors(
                    containerColor = AppColors.Surface,
                    labelColor = AppColors.TextPrimary,
                    selectedContainerColor = AppColors.Primary,
                    selectedLabelColor = AppColors.Surface,
                ),
            )
        }
    }
}
