package com.schoolapp.feature.admin.schools.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.admin.R

/** One school in the list: logo, name, code, branches, contact, status and created date. */
@Composable
internal fun SchoolRow(school: School, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), onClick = onClick) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(school.name, school.logoUrl)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    school.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    listOf(school.code, pluralStringResource(R.plurals.schools_branch_count, school.branchCount, school.branchCount))
                        .joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                    color = AppColors.TextSecondary,
                )
                val contact = school.email ?: school.phone
                val created = formatDate(school.createdAt)?.let { stringResource(R.string.schools_created_on, it) }
                listOfNotNull(contact, created).takeIf { it.isNotEmpty() }?.let {
                    Text(
                        it.joinToString(" · "),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
            StatusChip(schoolStatusLabel(school.status), schoolStatusTone(school.status))
        }
    }
}
