package com.schoolapp.feature.exams.promotions.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.promotions.PromotionDecision
import com.schoolapp.core.model.exams.promotions.PromotionRow
import com.schoolapp.core.model.exams.promotions.PromotionStatus
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.formatMarks

@Composable
@ReadOnlyComposable
internal fun decisionLabel(decision: PromotionDecision): String = stringResource(
    when (decision) {
        PromotionDecision.PROMOTE -> R.string.exams_promo_promote
        PromotionDecision.CONDITIONAL -> R.string.exams_promo_conditional
        PromotionDecision.REPEAT -> R.string.exams_promo_repeat
        PromotionDecision.GRADUATE -> R.string.exams_promo_graduate
    },
)

private fun PromotionDecision.tone(): StatusTone = when (this) {
    PromotionDecision.PROMOTE, PromotionDecision.GRADUATE -> StatusTone.Success
    PromotionDecision.CONDITIONAL -> StatusTone.Warning
    PromotionDecision.REPEAT -> StatusTone.Error
}

/** Student, class move, percent, decision vs suggestion and status; [onChange] null = read only. */
@Composable
internal fun PromotionRowCard(row: PromotionRow, onChange: (() -> Unit)?) {
    AppCard(verticalSpacing = 4.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f)) {
                Text(row.student.name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                val from = listOfNotNull(row.fromClass?.name, row.fromSection?.name).joinToString(" ")
                val to = listOfNotNull(row.toClass?.name, row.toSection?.name).joinToString(" ").ifEmpty { "—" }
                Text(stringResource(R.string.exams_promo_row_from, from, to), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            }
            StatusChip(decisionLabel(row.decision), row.decision.tone())
        }
        val details = listOfNotNull(
            row.percent?.let { stringResource(R.string.exams_promo_percent, formatMarks(it)) },
            row.failedSubjects.takeIf { it > 0 }?.let { stringResource(R.string.exams_promo_failed_subjects, it) },
            stringResource(statusText(row.status)),
            row.takeIf { it.decision != it.suggested }?.let { stringResource(R.string.exams_promo_suggested_was, decisionLabel(it.suggested)) },
        ).joinToString(" · ")
        Text(details, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        row.reason?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
        if (onChange != null && row.status == PromotionStatus.SUGGESTED) AppTextButton(stringResource(R.string.exams_promo_change), onChange)
    }
}

private fun statusText(status: PromotionStatus): Int = when (status) {
    PromotionStatus.SUGGESTED -> R.string.exams_promo_status_suggested
    PromotionStatus.CONFIRMED -> R.string.exams_promo_status_confirmed
    PromotionStatus.APPLIED -> R.string.exams_promo_status_applied
}
