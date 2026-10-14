package com.schoolapp.feature.admissions.enquiries

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.Enquiry
import com.schoolapp.core.model.admissions.EnquiryStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.people.DateField
import com.schoolapp.feature.admissions.R

/** Follow-up: status (new / contacted / closed), next follow-up date and notes. */
@Composable
internal fun EnquiryUpdateSheet(
    enquiry: Enquiry,
    busy: Boolean,
    error: AppError?,
    onSave: (EnquiryStatus, String, String) -> Unit,
    onDismiss: () -> Unit,
) {
    var status by rememberSaveable { mutableStateOf(enquiry.status.takeIf { it in EnquiryStatus.MANUAL } ?: EnquiryStatus.NEW) }
    var followUp by rememberSaveable { mutableStateOf(enquiry.followUpDate.orEmpty()) }
    var notes by rememberSaveable { mutableStateOf(enquiry.notes.orEmpty()) }
    AppBottomSheet(title = stringResource(R.string.admissions_update_enquiry, enquiry.childName), onDismiss = onDismiss) {
        Text("${enquiry.guardianName} · ${enquiry.phone}", style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stringResource(R.string.admissions_status), style = MaterialTheme.typography.labelMedium, color = AppColors.TextSecondary)
            FilterChipRow(
                options = EnquiryStatus.MANUAL.map { SwitcherOption(it.name, humanizeKey(it.name)) },
                selectedId = status.name,
                onSelect = { status = EnquiryStatus.valueOf(it) },
            )
        }
        DateField(stringResource(R.string.admissions_follow_up_date), followUp, { followUp = it }, null)
        AppTextArea(notes, { notes = it.take(EnquiryDraft.NOTES_MAX) }, stringResource(R.string.admissions_new_notes), minLines = 3)
        error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(stringResource(R.string.admissions_save_changes), { onSave(status, followUp, notes) }, Modifier.fillMaxWidth(), loading = busy)
    }
}
