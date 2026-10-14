package com.schoolapp.feature.settings.imports

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.settings.R

/** Kind, status, stepper, busy / failed / reverted notices, totals and the commit actions. */
@Composable
internal fun ImportStatusCard(state: ImportFlowUiState, detail: ImportDetail, vm: ImportFlowViewModel, onUploadAgain: () -> Unit) {
    AppCard(verticalSpacing = 12.dp, animateSize = false) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            detail.kind?.let {
                Text(importKindLabel(it), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            }
            StatusChip(humanizeKey(detail.status), importStatusTone(detail.status))
        }
        ImportStepper(detail.status, state.committed)
        busyText(detail.status)?.let { InlineMessage(stringResource(it), StatusTone.Info) }
        if (detail.status == ImportDetail.FAILED) {
            InlineMessage(detail.error ?: stringResource(R.string.settings_imports_failed), StatusTone.Error)
        }
        if (detail.status == ImportDetail.REVERTED) {
            InlineMessage(stringResource(R.string.settings_imports_reverted_notice), StatusTone.Warning)
        }
        if (detail.status != ImportDetail.VALIDATING) TotalsRow(state)
        state.commitError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        ImportCommitBar(state, vm, onUploadAgain)
        AppTextButton(stringResource(R.string.settings_imports_start_new), vm::reset, enabled = !state.busy)
    }
}

@Composable
private fun TotalsRow(state: ImportFlowUiState) {
    val totals = state.totals
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val cards: List<Pair<Int, Int>> = listOf(
            R.string.settings_imports_rows to totals.rows,
            R.string.settings_imports_valid to totals.valid,
            R.string.settings_imports_invalid to totals.invalid,
        )
        if (maxWidth >= WIDE) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                cards.forEach { (label, value) -> StatCard(stringResource(label), formatCount(value), Modifier.weight(1f)) }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                cards.forEach { (label, value) ->
                    StatCard(
                        label = stringResource(label),
                        value = formatCount(value),
                        modifier = Modifier.fillMaxWidth(),
                        tone = if (label == R.string.settings_imports_invalid && value > 0) StatusTone.Warning else StatusTone.Neutral,
                    )
                }
            }
        }
    }
}

private fun busyText(status: String): Int? = when (status) {
    ImportDetail.VALIDATING -> R.string.settings_imports_validating
    ImportDetail.COMMITTING -> R.string.settings_imports_committing
    else -> null
}

private val WIDE = 520.dp
