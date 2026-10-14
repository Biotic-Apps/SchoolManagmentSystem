package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.model.organisation.BranchSettingsValues
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.ActionErrorMessage
import com.schoolapp.feature.organisation.components.TimeInput

/** Attendance / diary / messaging rules and the bank details printed on fee challans (web "Branch settings"). */
@Composable
internal fun BranchSettingsSheet(form: SettingsForm, tools: BranchToolsEditor) {
    AppBottomSheet(title = stringResource(R.string.org_settings_of, form.branchName), onDismiss = tools::dismissSettings) {
        val values = form.values
        when {
            values != null -> SettingsFields(form, values, tools)
            form.loadError != null -> ErrorState(appErrorMessage(form.loadError), onRetry = tools::loadSettings)
            else -> LoadingState()
        }
    }
}

@Composable
private fun SettingsFields(form: SettingsForm, values: BranchSettingsValues, tools: BranchToolsEditor) {
    @Composable
    fun message(field: SettingsField): String? = form.errors[field]?.let { stringResource(it) }
    fun edit(field: SettingsField? = null, change: (BranchSettingsValues) -> BranchSettingsValues) = tools.editSettings(field, change)

    SectionHeader(stringResource(R.string.org_daily_rules))
    TimeInput(values.attendanceLockTime, stringResource(R.string.org_branch_attendance_lock), { v ->
        edit(SettingsField.LOCK) { it.copy(attendanceLockTime = v) }
    }, Modifier.fillMaxWidth())
    SwitchRow(
        title = stringResource(R.string.org_diary_moderation),
        supporting = stringResource(R.string.org_diary_moderation_hint),
        checked = values.diaryModeration,
        onCheckedChange = { on -> edit { it.copy(diaryModeration = on) } },
    )
    TimeInput(values.diaryClosingTime, stringResource(R.string.org_diary_closes), { v ->
        edit(SettingsField.DIARY_CLOSE) { it.copy(diaryClosingTime = v) }
    }, Modifier.fillMaxWidth())
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        TimeInput(values.officeFrom, stringResource(R.string.org_office_from), { v ->
            edit(SettingsField.OFFICE_TO) { it.copy(officeFrom = v) }
        }, Modifier.weight(1f))
        TimeInput(values.officeTo, stringResource(R.string.org_office_to), { v ->
            edit(SettingsField.OFFICE_TO) { it.copy(officeTo = v) }
        }, Modifier.weight(1f), message(SettingsField.OFFICE_TO))
    }
    SectionHeader(stringResource(R.string.org_bank_title), subtitle = stringResource(R.string.org_bank_hint))
    AppTextField(values.bankName, { v -> edit { it.copy(bankName = v.take(80)) } }, stringResource(R.string.org_bank_name), kind = FieldKind.Title)
    AppTextField(values.bankBranchCode, { v -> edit { it.copy(bankBranchCode = v.take(20)) } }, stringResource(R.string.org_bank_branch_code), kind = FieldKind.Code)
    AppTextField(values.bankAccountTitle, { v -> edit { it.copy(bankAccountTitle = v.take(100)) } }, stringResource(R.string.org_bank_account_title), kind = FieldKind.Name)
    AppTextField(
        values.bankAccountNumber,
        { v -> edit(SettingsField.ACCOUNT_NUMBER) { it.copy(bankAccountNumber = v.take(34)) } },
        stringResource(R.string.org_bank_account_number),
        errorText = message(SettingsField.ACCOUNT_NUMBER),
        kind = FieldKind.Code,
    )
    AppTextArea(
        values.challanNote,
        { v -> edit(SettingsField.CHALLAN_NOTE) { it.copy(challanNote = v.take(300)) } },
        stringResource(R.string.org_challan_note),
        supportingText = stringResource(R.string.org_challan_note_hint),
        minLines = 2,
        maxLines = 4,
    )
    ActionErrorMessage(form.error)
    PrimaryButton(stringResource(R.string.org_save_settings), onClick = tools::saveSettings, loading = form.saving)
}
