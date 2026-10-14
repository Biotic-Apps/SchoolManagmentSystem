package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormRules
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.SetupUiState
import com.schoolapp.feature.admin.schools.setup.components.SetupPanel
import com.schoolapp.feature.admin.schools.setup.components.TimeField
import com.schoolapp.feature.admin.schools.setup.components.WeekdayChips
import com.schoolapp.feature.admin.schools.setup.components.setupErrorText
import com.schoolapp.feature.admin.schools.setup.model.SetupKeys

@Composable
internal fun BranchStep(state: SetupUiState, edits: SetupFormEdits, modifier: Modifier = Modifier) {
    val branch = state.form.branch
    @Composable
    fun err(key: String) = setupErrorText(state.error(key))
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        SetupPanel(stringResource(R.string.setup_panel_branch), description = stringResource(R.string.setup_panel_branch_desc)) {
            AppTextField(
                value = branch.name,
                onValueChange = { v -> edits.branch { it.copy(name = v) } },
                label = stringResource(R.string.setup_branch_name),
                errorText = err(SetupKeys.BRANCH_NAME),
                kind = FieldKind.Title,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = branch.code,
                onValueChange = { v -> edits.branch { it.copy(code = AdminFormRules.cleanCode(v)) } },
                label = stringResource(R.string.setup_branch_code),
                errorText = err(SetupKeys.BRANCH_CODE),
                kind = FieldKind.Code,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = branch.phone,
                onValueChange = { v -> edits.branch { it.copy(phone = v) } },
                label = stringResource(R.string.setup_phone_optional),
                errorText = err(SetupKeys.BRANCH_PHONE),
                kind = FieldKind.Phone,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextField(
                value = branch.email,
                onValueChange = { v -> edits.branch { it.copy(email = v) } },
                label = stringResource(R.string.setup_email_optional),
                errorText = err(SetupKeys.BRANCH_EMAIL),
                kind = FieldKind.Email,
                modifier = Modifier.fillMaxWidth(),
            )
            AppTextArea(
                value = branch.address,
                onValueChange = { v -> edits.branch { it.copy(address = v) } },
                label = stringResource(R.string.setup_address),
                minLines = 2,
                maxLines = 4,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        SetupPanel(stringResource(R.string.setup_panel_timings), description = stringResource(R.string.setup_panel_timings_desc)) {
            TimeField(
                stringResource(R.string.setup_opens), branch.opensAt, { v -> edits.branch { it.copy(opensAt = v) } },
                hint = stringResource(R.string.setup_opens_hint), error = err(SetupKeys.OPENS_AT),
            )
            TimeField(
                stringResource(R.string.setup_closes), branch.closesAt, { v -> edits.branch { it.copy(closesAt = v) } },
                hint = stringResource(R.string.setup_closes_hint), error = err(SetupKeys.CLOSES_AT),
            )
            TimeField(
                stringResource(R.string.setup_lock), branch.attendanceLockAt, { v -> edits.branch { it.copy(attendanceLockAt = v) } },
                hint = stringResource(R.string.setup_lock_hint), error = err(SetupKeys.LOCK_AT),
            )
            TimeField(
                stringResource(R.string.setup_staff_arrives), branch.staffArrivesAt, { v -> edits.branch { it.copy(staffArrivesAt = v) } },
                hint = stringResource(R.string.setup_staff_arrives_hint), error = err(SetupKeys.STAFF_ARRIVES),
            )
            TimeField(
                stringResource(R.string.setup_staff_leaves), branch.staffLeavesAt, { v -> edits.branch { it.copy(staffLeavesAt = v) } },
                hint = stringResource(R.string.setup_staff_leaves_hint), error = err(SetupKeys.STAFF_LEAVES),
            )
            WeekdayChips(
                label = stringResource(R.string.setup_working_days),
                days = branch.workingDays,
                onChange = { v -> edits.branch { it.copy(workingDays = v) } },
                error = err(SetupKeys.WORKING_DAYS),
            )
        }
    }
}
