package com.schoolapp.feature.admissions.enquiries

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Assignment
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.model.admissions.Enquiry
import com.schoolapp.core.model.admissions.EnquiryStatus
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.admissions.R
import com.schoolapp.feature.admissions.common.AdmissionAccess

/** One enquiry with call, follow-up and convert actions. */
@Composable
internal fun EnquiryDetailsSheet(
    enquiry: Enquiry,
    access: AdmissionAccess,
    onUpdate: () -> Unit,
    onConvert: () -> Unit,
    onOpenApplication: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val external = rememberExternalActions()
    AppBottomSheet(title = enquiry.childName, onDismiss = onDismiss) {
        StatusChip(humanizeKey(enquiry.status.name), statusTone(enquiry.status.name))
        KeyValueRow(stringResource(R.string.admissions_class), enquiry.className)
        KeyValueRow(stringResource(R.string.admissions_dob), formatDate(enquiry.dob))
        KeyValueRow(stringResource(R.string.admissions_guardian_name), enquiry.guardianName)
        KeyValueRow(stringResource(R.string.admissions_phone), enquiry.phone)
        KeyValueRow(stringResource(R.string.admissions_email), enquiry.email)
        KeyValueRow(stringResource(R.string.admissions_source), enquiry.source)
        KeyValueRow(stringResource(R.string.admissions_follow_up_date), formatDate(enquiry.followUpDate))
        KeyValueRow(stringResource(R.string.admissions_new_notes), enquiry.notes)
        KeyValueRow(stringResource(R.string.admissions_created_on), formatDate(enquiry.createdAt))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton(stringResource(R.string.admissions_call), { external.dial(enquiry.phone) }, Modifier.weight(1f), leadingIcon = Icons.Outlined.Call)
            if (access.canEdit && enquiry.status != EnquiryStatus.CONVERTED) {
                SecondaryButton(stringResource(R.string.admissions_follow_up), onUpdate, Modifier.weight(1f), leadingIcon = Icons.Outlined.Edit)
            }
        }
        if (access.canAdd && enquiry.status.isOpen) {
            PrimaryButton(stringResource(R.string.admissions_convert), onConvert, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.SwapHoriz)
        }
        enquiry.applicationId?.let { id ->
            SecondaryButton(
                stringResource(R.string.admissions_open_application),
                { onOpenApplication(id) },
                Modifier.fillMaxWidth(),
                leadingIcon = Icons.AutoMirrored.Outlined.Assignment,
            )
        }
    }
}
