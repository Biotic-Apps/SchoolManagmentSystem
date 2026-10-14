package com.schoolapp.feature.admissions.confirm

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.AdmissionFeeStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.people.DateField
import com.schoolapp.feature.admissions.R

@Composable
internal fun ConfirmFormContent(state: ConfirmAdmissionUiState, viewModel: ConfirmAdmissionViewModel, modifier: Modifier = Modifier) {
    val required = stringResource(R.string.admissions_required)
    ScreenColumn(modifier) {
        item { InlineMessage(stringResource(R.string.admissions_confirm_hint), StatusTone.Info) }
        if (state.allFull) item { InlineMessage(stringResource(R.string.admissions_all_full, state.className.orEmpty()), StatusTone.Warning) }
        item {
            AppCard(Modifier.fillMaxWidth()) {
                SectionHeader(title = stringResource(R.string.admissions_placement), subtitle = state.className)
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    val full = stringResource(R.string.admissions_section_full)
                    CreatablePickerField(
                        label = stringResource(R.string.admissions_section),
                        options = state.sections.map { s ->
                            val seats = stringResource(R.string.admissions_seats, s.used, s.capacity?.toString() ?: "—")
                            PickerOption(s.id, s.name, if (s.isFull) "$seats · $full" else seats)
                        },
                        selectedId = state.sectionId,
                        onSelect = { it?.let(viewModel::onSection) },
                        errorText = when {
                            ConfirmField.SECTION !in state.problems -> null
                            state.sections.firstOrNull { it.id == state.sectionId }?.isFull == true -> stringResource(R.string.admissions_section_is_full)
                            else -> required
                        },
                    )
                    DateField(
                        label = stringResource(R.string.admissions_admission_date),
                        value = state.admissionDate,
                        onPick = viewModel::onDate,
                        error = if (ConfirmField.DATE in state.problems) required else null,
                    )
                }
            }
        }
        item { FeeCard(state, viewModel) }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                state.submitError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
                PrimaryButton(
                    text = stringResource(R.string.admissions_confirm_admission),
                    onClick = viewModel::submit,
                    loading = state.submitting,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

@Composable
private fun FeeCard(state: ConfirmAdmissionUiState, viewModel: ConfirmAdmissionViewModel) {
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_admission_fee))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChipRow(
                options = listOf(
                    SwitcherOption(AdmissionFeeStatus.PAID.name, stringResource(R.string.admissions_fee_paid)),
                    SwitcherOption(AdmissionFeeStatus.WAIVED.name, stringResource(R.string.admissions_fee_waived)),
                    SwitcherOption(AdmissionFeeStatus.PENDING.name, stringResource(R.string.admissions_fee_pending)),
                ),
                selectedId = state.feeStatus?.name,
                onSelect = { viewModel.onFeeStatus(AdmissionFeeStatus.valueOf(it)) },
            )
            if (ConfirmField.FEE_STATUS in state.problems) {
                Text(stringResource(R.string.admissions_fee_choose), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
            }
            if (state.feeStatus == AdmissionFeeStatus.PAID) {
                MoneyField(
                    value = state.feeAmount,
                    onValueChange = viewModel::onFeeAmount,
                    label = stringResource(R.string.admissions_fee_amount),
                    errorText = if (ConfirmField.FEE_AMOUNT in state.problems) stringResource(R.string.admissions_fee_amount_invalid) else null,
                )
                AppTextField(
                    value = state.feeReference,
                    onValueChange = viewModel::onFeeReference,
                    label = stringResource(R.string.admissions_fee_reference),
                    supportingText = stringResource(R.string.admissions_new_optional),
                )
            }
        }
    }
}
