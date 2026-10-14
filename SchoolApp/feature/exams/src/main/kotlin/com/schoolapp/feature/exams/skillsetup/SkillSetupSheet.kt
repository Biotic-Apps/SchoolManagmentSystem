package com.schoolapp.feature.exams.skillsetup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ArrowDownward
import androidx.compose.material.icons.outlined.ArrowUpward
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.SkillDomain
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R

@Composable
internal fun SkillSetupSheet(draft: SkillSetupDraft, viewModel: SkillSetupViewModel) {
    AppBottomSheet(title = stringResource(R.string.exams_skillsetup_title), onDismiss = viewModel::dismiss) {
        Text(stringResource(R.string.exams_skillsetup_hint), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        draft.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SkillDomain.entries.forEach { domain -> DomainItems(domain, draft, viewModel) }
        SectionHeader(title = stringResource(R.string.exams_skillsetup_scale))
        if (draft.tooFewLevels) InlineMessage(stringResource(R.string.exams_skillsetup_levels_count), StatusTone.Error)
        draft.levels.forEach { level ->
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AppTextField(
                    value = level.code,
                    onValueChange = { viewModel.editLevel(level.key, code = it) },
                    label = stringResource(R.string.exams_skillsetup_code),
                    modifier = Modifier.weight(1f),
                )
                AppTextField(
                    value = level.label,
                    onValueChange = { viewModel.editLevel(level.key, label = it) },
                    label = stringResource(R.string.exams_skillsetup_label),
                    modifier = Modifier.weight(2f),
                )
                SmallIcon(Icons.Outlined.DeleteOutline, R.string.exams_skillsetup_remove, AppColors.Error) { viewModel.removeLevel(level.key) }
            }
            if (level.key in draft.invalidKeys) ErrorLine(stringResource(R.string.exams_skillsetup_level_invalid))
        }
        AppTextButton(stringResource(R.string.exams_skillsetup_add_level), viewModel::addLevel, leadingIcon = Icons.Outlined.Add)
        PrimaryButton(stringResource(R.string.exams_skillsetup_save), viewModel::save, Modifier.fillMaxWidth(), loading = draft.isSaving)
    }
}

@Composable
private fun DomainItems(domain: SkillDomain, draft: SkillSetupDraft, viewModel: SkillSetupViewModel) {
    val title = if (domain == SkillDomain.AFFECTIVE) R.string.exams_skillsetup_affective else R.string.exams_skillsetup_psychomotor
    SectionHeader(title = stringResource(title))
    val items = draft.items.filter { it.domain == domain }
    items.forEachIndexed { index, item ->
        Row(verticalAlignment = Alignment.CenterVertically) {
            AppTextField(
                value = item.name,
                onValueChange = { viewModel.renameItem(item.key, it) },
                label = stringResource(R.string.exams_skillsetup_item),
                modifier = Modifier.weight(1f),
            )
            if (index > 0) SmallIcon(Icons.Outlined.ArrowUpward, R.string.exams_skillsetup_move_up) { viewModel.moveItem(item.key, -1) }
            if (index < items.lastIndex) SmallIcon(Icons.Outlined.ArrowDownward, R.string.exams_skillsetup_move_down) { viewModel.moveItem(item.key, 1) }
            SmallIcon(Icons.Outlined.DeleteOutline, R.string.exams_skillsetup_remove, AppColors.Error) { viewModel.removeItem(item.key) }
        }
        if (item.key in draft.invalidKeys) ErrorLine(stringResource(R.string.exams_skillsetup_item_invalid))
    }
    AppTextButton(stringResource(R.string.exams_skillsetup_add_item), { viewModel.addItem(domain) }, leadingIcon = Icons.Outlined.Add)
}

@Composable
private fun SmallIcon(icon: ImageVector, description: Int, tint: androidx.compose.ui.graphics.Color = AppColors.TextSecondary, onClick: () -> Unit) {
    IconButton(onClick = onClick) { Icon(icon, contentDescription = stringResource(description), tint = tint) }
}

@Composable
private fun ErrorLine(text: String) = Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
