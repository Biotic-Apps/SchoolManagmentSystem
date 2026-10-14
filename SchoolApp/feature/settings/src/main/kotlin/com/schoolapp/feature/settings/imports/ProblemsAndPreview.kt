package com.schoolapp.feature.settings.imports

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.ImportRowError
import com.schoolapp.core.model.settings.ImportValue
import com.schoolapp.feature.settings.R

/** "Problems to fix" (row, column, message) and the first parsed rows as cards. */
internal fun LazyListScope.problemsAndPreviewItems(errors: List<ImportRowError>, preview: List<Map<String, ImportValue>>) {
    if (errors.isNotEmpty()) {
        item(key = "imp_problems_header") {
            SectionHeader(
                title = stringResource(R.string.settings_imports_problems),
                subtitle = if (errors.size == ERROR_LIMIT) stringResource(R.string.settings_imports_problems_limit) else null,
            )
        }
        itemsIndexed(errors, key = { index, _ -> "imp_problem_$index" }) { _, error -> ProblemRow(error) }
    }
    if (preview.isNotEmpty()) {
        item(key = "imp_preview_header") {
            SectionHeader(title = stringResource(R.string.settings_imports_preview, preview.size))
        }
        itemsIndexed(preview, key = { index, _ -> "imp_preview_$index" }) { index, row -> PreviewRow(index, row) }
    }
}

@Composable
private fun ProblemRow(error: ImportRowError) {
    AppCard(contentPadding = 12.dp, verticalSpacing = 2.dp) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                stringResource(R.string.settings_imports_row_number, formatCount(error.row)),
                style = MaterialTheme.typography.labelLarge,
                color = AppColors.TextPrimary,
            )
            error.column?.let { Text(it, style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary) }
        }
        Text(error.message, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
    }
}

@Composable
private fun PreviewRow(index: Int, row: Map<String, ImportValue>) {
    val dash = stringResource(R.string.settings_dash)
    val yes = stringResource(R.string.settings_imports_yes)
    val no = stringResource(R.string.settings_imports_no)
    AppCard(contentPadding = 12.dp, verticalSpacing = 0.dp) {
        Text(
            stringResource(R.string.settings_imports_preview_row, index + 1),
            style = MaterialTheme.typography.labelLarge,
            color = AppColors.TextSecondary,
        )
        row.forEach { (key, value) -> KeyValueRow(humanizeColumn(key), formatImportValue(key, value, yes, no) ?: dash) }
    }
}

private const val ERROR_LIMIT = 500
