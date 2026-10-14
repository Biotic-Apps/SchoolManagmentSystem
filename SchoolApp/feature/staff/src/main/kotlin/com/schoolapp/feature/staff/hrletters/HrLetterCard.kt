package com.schoolapp.feature.staff.hrletters

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.hrletters.HrLetter
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.staff.R

/** One issued letter: subject, type and issue time, with a PDF button when the file exists. */
@Composable
internal fun HrLetterCard(
    letter: HrLetter,
    opening: Boolean,
    onDownload: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            IconTile(Icons.Outlined.Description, StatusTone.Info)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(letter.subject, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(
                    listOfNotNull(hrLetterTypeLabel(letter.type), formatTimestamp(letter.issuedAt)).joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary,
                )
                if (letter.fileUrl == null) {
                    Text(stringResource(R.string.staff_hr_pdf_missing), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            if (letter.fileUrl != null) {
                SecondaryButton(
                    text = stringResource(R.string.staff_hr_pdf),
                    onClick = onDownload,
                    loading = opening,
                    leadingIcon = Icons.Outlined.Download,
                )
            }
        }
    }
}
