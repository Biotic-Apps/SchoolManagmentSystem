package com.schoolapp.feature.settings.imports

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.model.settings.ImportValue
import com.schoolapp.feature.settings.R

/** Created / skipped counts, money totals and any further fields of a committed import's report. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ReconciliationCard(detail: ImportDetail) {
    val report = detail.reconciliation.orEmpty()
    val created = report.firstCount(CREATED) ?: detail.totals.valid.toLong()
    val skipped = report.firstCount(SKIPPED) ?: detail.totals.invalid.toLong()
    val fileTotal = (report[FILE_TOTAL] as? ImportValue.Number)?.value?.toLong()
    val importedTotal = (report[IMPORTED_TOTAL] as? ImportValue.Number)?.value?.toLong()
    val totals = if (fileTotal != null && importedTotal != null) fileTotal to importedTotal else null
    val known = CREATED + SKIPPED + listOf(FILE_TOTAL, IMPORTED_TOTAL)
    val extras = report.filter { (key, value) -> key !in known && value !is ImportValue.Json && value != ImportValue.Empty }
    val yes = stringResource(R.string.settings_imports_yes)
    val no = stringResource(R.string.settings_imports_no)
    AppCard(verticalSpacing = 12.dp, animateSize = false) {
        SectionHeader(
            title = stringResource(R.string.settings_imports_reconciliation),
            action = if (totals != null) {
                { TotalsChip(matched = totals.first == totals.second) }
            } else {
                null
            },
        )
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard(stringResource(R.string.settings_imports_rows_created), formatNumber(created.toDouble()), Modifier.widthIn(min = MIN_TILE))
            StatCard(stringResource(R.string.settings_imports_rows_skipped), formatNumber(skipped.toDouble()), Modifier.widthIn(min = MIN_TILE))
            totals?.let { (file, imported) ->
                StatCard(stringResource(R.string.settings_imports_file_total), MoneyFormat.format(file), Modifier.widthIn(min = MIN_TILE))
                StatCard(stringResource(R.string.settings_imports_imported_total), MoneyFormat.format(imported), Modifier.widthIn(min = MIN_TILE))
            }
        }
        extras.forEach { (key, value) ->
            KeyValueRow(humanizeColumn(key.removeSuffix("Minor")), formatImportValue(key, value, yes, no))
        }
    }
}

@Composable
private fun TotalsChip(matched: Boolean) {
    StatusChip(
        text = stringResource(if (matched) R.string.settings_imports_totals_match else R.string.settings_imports_totals_differ),
        tone = if (matched) StatusTone.Success else StatusTone.Error,
    )
}

private fun Map<String, ImportValue>.firstCount(keys: List<String>): Long? =
    keys.firstNotNullOfOrNull { (this[it] as? ImportValue.Number)?.value?.toLong() }

private val CREATED = listOf("created", "rowsCreated", "createdCount", "imported", "importedRows")
private val SKIPPED = listOf("skipped", "rowsSkipped", "skippedCount")
private const val FILE_TOTAL = "fileTotalMinor"
private const val IMPORTED_TOTAL = "importedTotalMinor"
private val MIN_TILE = 140.dp
