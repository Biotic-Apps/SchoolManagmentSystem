package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.FactCheck
import androidx.compose.material.icons.outlined.HowToReg
import androidx.compose.material.icons.automirrored.outlined.Undo
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.feature.admissions.R

/** Workflow buttons; only the ones allowed now (permission + status) are shown. */
@Composable
internal fun ApplicationActionsCard(
    actions: ApplicationActionFlags,
    hasTest: Boolean,
    onOpen: (DetailSheet) -> Unit,
    onEdit: () -> Unit,
    onConfirm: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (!actions.any) return
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_next_steps))
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            if (actions.confirm) {
                PrimaryButton(stringResource(R.string.admissions_confirm_admission), onConfirm, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.HowToReg)
            }
            if (actions.decide) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    SecondaryButton(stringResource(R.string.admissions_waitlist), { onOpen(DetailSheet.Decide(AdmissionDecision.WAITLIST)) }, Modifier.weight(1f))
                    PrimaryButton(stringResource(R.string.admissions_offer), { onOpen(DetailSheet.Decide(AdmissionDecision.OFFER)) }, Modifier.weight(1f))
                }
            }
            if (actions.recordResult) {
                SecondaryButton(stringResource(R.string.admissions_record_result), { onOpen(DetailSheet.TestResult) }, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.FactCheck)
            }
            if (actions.scheduleTest) {
                val label = if (hasTest) R.string.admissions_reschedule_test else R.string.admissions_schedule_test
                SecondaryButton(stringResource(label), { onOpen(DetailSheet.ScheduleTest) }, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.EventAvailable)
            }
            if (actions.edit) {
                SecondaryButton(stringResource(R.string.admissions_edit), onEdit, Modifier.fillMaxWidth(), leadingIcon = Icons.Outlined.Edit)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (actions.decide) {
                    AppTextButton(stringResource(R.string.admissions_reject), { onOpen(DetailSheet.Decide(AdmissionDecision.REJECT)) }, contentColor = AppColors.Error)
                }
                if (actions.withdraw) {
                    AppTextButton(
                        stringResource(R.string.admissions_withdraw),
                        { onOpen(DetailSheet.Withdraw) },
                        leadingIcon = Icons.AutoMirrored.Outlined.Undo,
                        contentColor = AppColors.Error,
                    )
                }
            }
        }
    }
}
