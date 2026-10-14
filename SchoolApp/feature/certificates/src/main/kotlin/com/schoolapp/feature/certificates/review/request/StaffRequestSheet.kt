package com.schoolapp.feature.certificates.review.request

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.certificates.R
import com.schoolapp.feature.certificates.components.WrapChoiceChips
import com.schoolapp.feature.certificates.components.certificateTypeLabel
import com.schoolapp.feature.certificates.components.needsClearance

internal class StaffRequestCallbacks(
    val onQueryChange: (String) -> Unit,
    val onPick: (StudentSummary) -> Unit,
    val onClearStudent: () -> Unit,
    val onTypeChange: (CertificateType) -> Unit,
    val onPurposeChange: (String) -> Unit,
    val onAchievementChange: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)

@Composable
internal fun StaffRequestSheet(form: StaffRequestForm, callbacks: StaffRequestCallbacks) {
    AppBottomSheet(title = stringResource(R.string.certificates_new_request), onDismiss = callbacks.onDismiss) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SectionHeader(title = stringResource(R.string.certificates_choose_student))
        val student = form.student
        if (student != null) {
            AppCard(Modifier.fillMaxWidth()) {
                Text(student.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                studentLine(student)?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
                if (!form.isSaving) AppTextButton(stringResource(R.string.certificates_change_student), callbacks.onClearStudent)
            }
        } else {
            StudentPicker(form.search, callbacks.onQueryChange, callbacks.onPick)
            if (form.studentMissing) ErrorText(stringResource(R.string.certificates_student_required))
        }
        SectionHeader(title = stringResource(R.string.certificates_type))
        WrapChoiceChips(
            options = CertificateType.entries.map { SwitcherOption(it.name, certificateTypeLabel(it)) },
            selectedId = form.type?.name,
            onSelect = { callbacks.onTypeChange(CertificateType.valueOf(it)) },
            enabled = !form.isSaving,
        )
        if (form.typeMissing) ErrorText(stringResource(R.string.certificates_type_required))
        if (form.type?.needsClearance() == true) InlineMessage(stringResource(R.string.certificates_clearance_note), StatusTone.Info)
        if (form.type == CertificateType.ACHIEVEMENT) {
            AppTextArea(
                value = form.achievement,
                onValueChange = callbacks.onAchievementChange,
                label = stringResource(R.string.certificates_achievement),
                enabled = !form.isSaving,
                errorText = if (form.achievementMissing) stringResource(R.string.certificates_achievement_required) else null,
            )
        }
        AppTextArea(
            value = form.purpose,
            onValueChange = callbacks.onPurposeChange,
            label = stringResource(R.string.certificates_purpose_optional),
            enabled = !form.isSaving,
        )
        PrimaryButton(stringResource(R.string.certificates_send_request), callbacks.onSubmit, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}

@Composable
private fun StudentPicker(search: StudentSearchState, onQueryChange: (String) -> Unit, onPick: (StudentSummary) -> Unit) {
    SearchField(value = search.query, onValueChange = onQueryChange, placeholder = stringResource(R.string.certificates_search_students))
    when {
        search.searching -> LoadingState()
        search.error != null -> InlineMessage(appErrorMessage(search.error), StatusTone.Error)
        search.searched && search.results.isEmpty() -> InlineMessage(stringResource(R.string.certificates_search_empty), StatusTone.Info)
        else -> Column {
            search.results.take(MAX_RESULTS).forEach { student ->
                Column(Modifier.fillMaxWidth().clickable { onPick(student) }.padding(vertical = 8.dp)) {
                    Text(student.name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                    studentLine(student)?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
                }
            }
        }
    }
}

@Composable
private fun ErrorText(text: String) = Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)

private fun studentLine(student: StudentSummary): String? {
    val classSection = listOfNotNull(student.className, student.sectionName).joinToString("-").ifEmpty { null }
    return listOfNotNull(student.admissionNo, classSection).joinToString(" · ").ifEmpty { null }
}

private const val MAX_RESULTS = 8
