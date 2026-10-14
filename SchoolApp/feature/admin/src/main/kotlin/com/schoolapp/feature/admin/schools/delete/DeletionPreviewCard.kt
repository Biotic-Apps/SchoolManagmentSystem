package com.schoolapp.feature.admin.schools.delete

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.schools.SchoolDeletionPreview
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.admin.R

/** "What will be removed": one line per record type, kept accounts and the last-school warning. */
@Composable
internal fun DeletionPreviewCard(preview: SchoolDeletionPreview, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        if (preview.summary.isEmpty()) {
            Text(stringResource(R.string.schools_delete_no_records), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        preview.summary.forEach { (key, count) ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("%,d".format(count), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
                Text(deletionLabel(key, count), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            }
        }
        if (preview.keptUsers > 0) {
            Text(
                pluralStringResource(R.plurals.schools_delete_kept_users, preview.keptUsers, preview.keptUsers),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
    }
    if (preview.lastActiveSchool) {
        InlineMessage(stringResource(R.string.schools_delete_last_school), StatusTone.Warning)
    }
}

@Composable
private fun deletionLabel(key: String, count: Int): String {
    val plural = when (key) {
        "branches" -> R.plurals.schools_del_branches
        "users" -> R.plurals.schools_del_users
        "staff" -> R.plurals.schools_del_staff
        "students" -> R.plurals.schools_del_students
        "guardians" -> R.plurals.schools_del_guardians
        "sessions" -> R.plurals.schools_del_sessions
        "classes" -> R.plurals.schools_del_classes
        "sections" -> R.plurals.schools_del_sections
        "subjects" -> R.plurals.schools_del_subjects
        "timetables" -> R.plurals.schools_del_timetables
        "attendance" -> R.plurals.schools_del_attendance
        "exams" -> R.plurals.schools_del_exams
        "invoices" -> R.plurals.schools_del_invoices
        "payments" -> R.plurals.schools_del_payments
        "files" -> R.plurals.schools_del_files
        else -> return humanizeKey(key).lowercase()
    }
    return pluralStringResource(plural, count)
}
