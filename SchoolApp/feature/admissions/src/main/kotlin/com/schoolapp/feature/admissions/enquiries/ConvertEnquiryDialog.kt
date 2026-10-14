package com.schoolapp.feature.admissions.enquiries

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.Enquiry
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.people.DateField
import com.schoolapp.core.ui.people.GenderChips
import com.schoolapp.feature.admissions.R

/** Converts an open enquiry into an application; asks for what the enquiry did not capture (gender, date of birth). */
@Composable
internal fun ConvertEnquiryDialog(
    enquiry: Enquiry,
    busy: Boolean,
    error: AppError?,
    onConvert: (gender: String, dob: String) -> Unit,
    onDismiss: () -> Unit,
) {
    var gender by rememberSaveable { mutableStateOf("") }
    var dob by rememberSaveable { mutableStateOf("") }
    var tried by rememberSaveable { mutableStateOf(false) }
    val needsDob = enquiry.dob.isNullOrBlank()
    val required = stringResource(R.string.admissions_required)
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AppColors.Surface,
        shape = MaterialTheme.shapes.medium,
        title = { Text(stringResource(R.string.admissions_convert_title, enquiry.childName), style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(stringResource(R.string.admissions_convert_message), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                GenderChips(gender, { gender = it }, if (tried && gender.isBlank()) required else null)
                if (needsDob) {
                    DateField(stringResource(R.string.admissions_dob), dob, { dob = it }, if (tried && dob.isBlank()) required else null,
                        maxDate = java.time.LocalDate.now().toString())
                }
                error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
            }
        },
        confirmButton = {
            AppTextButton(
                text = stringResource(R.string.admissions_convert_short),
                onClick = {
                    tried = true
                    if (gender.isNotBlank() && (!needsDob || dob.isNotBlank())) onConvert(gender, dob)
                },
                loading = busy,
            )
        },
        dismissButton = {
            AppTextButton(stringResource(android.R.string.cancel), onDismiss, enabled = !busy, contentColor = AppColors.TextSecondary)
        },
    )
}
