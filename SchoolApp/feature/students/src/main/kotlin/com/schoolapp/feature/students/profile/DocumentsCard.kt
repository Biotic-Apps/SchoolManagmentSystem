package com.schoolapp.feature.students.profile

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentDocument
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.students.R

/** Read-only; tapping a document opens its signed link in a viewer app. */
@Composable
internal fun DocumentsCard(documents: List<StudentDocument>, onOpen: (String) -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.students_documents))
        if (documents.isEmpty()) {
            Text(stringResource(R.string.students_documents_empty), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        documents.forEach { document ->
            val label = humanizeKey(document.docType)
            ListItemRow(
                title = label,
                supporting = document.note,
                leadingIcon = Icons.Outlined.Description,
                onClick = document.fileUrl?.let { url -> { onOpen(url) } },
                trailing = document.status?.let { status -> { StatusChip(humanizeKey(status), statusTone(status)) } },
            )
        }
    }
}
