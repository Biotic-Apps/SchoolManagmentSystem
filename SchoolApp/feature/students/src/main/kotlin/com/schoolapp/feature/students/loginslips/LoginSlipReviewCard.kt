package com.schoolapp.feature.students.loginslips

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.guardians.LoginSlipPreview
import com.schoolapp.feature.students.R

/** What printing will do, shown before anything changes (web LoginSlipReview). */
@Composable
internal fun LoginSlipReviewCard(review: LoginSlipPreview) {
    AppCard(Modifier.fillMaxWidth()) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                pluralStringResource(R.plurals.students_slips_summary, review.slips, review.slips, review.students),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
            )
            review.loginUrl?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
            listOf(
                review.create to R.plurals.students_slips_create,
                review.reset to R.plurals.students_slips_reset,
                review.keep to R.plurals.students_slips_keep,
                review.skip to R.plurals.students_slips_skip,
            ).filter { it.first > 0 }.forEach { (count, text) ->
                Text(pluralStringResource(text, count, count), style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
    if (review.changes > 0) {
        InlineMessage(pluralStringResource(R.plurals.students_slips_warning, review.changes, review.changes), StatusTone.Warning)
    }
}
