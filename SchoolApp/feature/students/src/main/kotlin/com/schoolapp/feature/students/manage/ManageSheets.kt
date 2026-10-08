package com.schoolapp.feature.students.manage

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.people.ChildFields
import com.schoolapp.core.ui.people.DateField
import com.schoolapp.core.ui.people.GuardianFields
import com.schoolapp.core.ui.people.RelationChips
import com.schoolapp.core.ui.people.text
import com.schoolapp.feature.students.R

/** Renders whichever sheet [ManageController] has open. */
@Composable
fun ManageSheetHost(sheet: ManageSheet?, today: String, controller: ManageController) {
    when (sheet) {
        null -> Unit
        is ManageSheet.Edit -> AppBottomSheet(stringResource(R.string.students_edit_title), controller::close) {
            ChildFields(sheet.form, sheet.errors, controller::onEditChange, today, prefix = "", showPreviousSchool = false)
            Text(stringResource(R.string.students_bform_keep), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            Footer(sheet.error, sheet.saving, stringResource(R.string.students_save), controller::saveEdit)
        }
        is ManageSheet.Placement -> PlacementSheet(sheet, today, controller)
        is ManageSheet.AddGuardian -> AddGuardianSheet(sheet, controller)
        is ManageSheet.EditGuardian -> AppBottomSheet(stringResource(R.string.students_edit_guardian), controller::close) {
            GuardianFields(sheet.form, sheet.errors, "", controller::onGuardianEdit)
            Footer(sheet.error, sheet.saving, stringResource(R.string.students_save), controller::saveGuardian)
        }
    }
}

@Composable
private fun PlacementSheet(sheet: ManageSheet.Placement, today: String, controller: ManageController) {
    val (title, button) = when (sheet.kind) {
        PlacementKind.WITHDRAW -> R.string.students_withdraw_title to R.string.students_withdraw
        PlacementKind.CHANGE_SECTION -> R.string.students_change_section to R.string.students_change_section
        PlacementKind.TRANSFER -> R.string.students_transfer_title to R.string.students_request_transfer
    }
    AppBottomSheet(stringResource(title), controller::close) {
        when (sheet.kind) {
            PlacementKind.WITHDRAW -> InlineMessage(stringResource(R.string.students_withdraw_hint), StatusTone.Warning)
            PlacementKind.TRANSFER -> InlineMessage(stringResource(R.string.students_transfer_hint), StatusTone.Info)
            PlacementKind.CHANGE_SECTION -> Unit
        }
        if (sheet.kind != PlacementKind.WITHDRAW) {
            CreatablePickerField(
                label = stringResource(if (sheet.kind == PlacementKind.TRANSFER) R.string.students_to_branch else R.string.students_to_section),
                options = sheet.options.map { PickerOption(it.id, it.label, it.supporting) },
                selectedId = sheet.targetId,
                onSelect = { it?.let(controller::onTarget) },
                errorText = sheet.errors.text(ManageController.TARGET),
                enabled = !sheet.loadingOptions,
            )
            if (!sheet.loadingOptions && sheet.options.isEmpty()) {
                InlineMessage(stringResource(R.string.students_no_targets), StatusTone.Warning)
            }
        }
        DateField(stringResource(R.string.students_effective_date), sheet.effectiveDate, controller::onEffectiveDate,
            sheet.errors.text(ManageController.DATE), maxDate = if (sheet.kind == PlacementKind.TRANSFER) null else today)
        AppTextField(
            value = sheet.reason,
            onValueChange = controller::onReason,
            label = stringResource(R.string.students_reason),
            errorText = sheet.errors.text(ManageController.REASON),
            singleLine = false,
            minLines = 2,
            kind = FieldKind.Sentence,
        )
        Footer(sheet.error, sheet.saving, stringResource(button), controller::savePlacement)
    }
}

@Composable
private fun AddGuardianSheet(sheet: ManageSheet.AddGuardian, controller: ManageController) {
    AppBottomSheet(stringResource(R.string.students_add_guardian), controller::close) {
        FilterChipRow(
            options = listOf(
                SwitcherOption(EXISTING, stringResource(R.string.students_guardian_existing)),
                SwitcherOption(NEW, stringResource(R.string.students_guardian_new)),
            ),
            selectedId = if (sheet.existing) EXISTING else NEW,
            onSelect = { controller.setExistingMode(it == EXISTING) },
        )
        if (sheet.existing) {
            AppTextField(
                value = sheet.query,
                onValueChange = controller::search,
                label = stringResource(R.string.students_guardian_search),
                kind = FieldKind.Text,
                imeAction = ImeAction.Search,
            )
            CreatablePickerField(
                label = stringResource(R.string.students_guardian),
                options = sheet.results.map { PickerOption(it.id, it.name, listOfNotNull(it.phone, it.email).joinToString(" · ")) },
                selectedId = sheet.selectedId,
                onSelect = { it?.let(controller::selectGuardian) },
                errorText = sheet.errors.text(ManageController.GUARDIAN),
            )
            RelationChips(sheet.relation, controller::onLinkRelation, sheet.errors.text(ManageController.RELATION))
        } else {
            GuardianFields(sheet.form, sheet.errors, "guardian.", controller::onNewGuardian)
        }
        SwitchRow(title = stringResource(R.string.students_make_primary), checked = sheet.isPrimary, onCheckedChange = controller::onLinkPrimary)
        Footer(sheet.error, sheet.saving, stringResource(R.string.students_link_guardian), controller::saveLink)
    }
}

@Composable
private fun Footer(error: ActionError?, saving: Boolean, label: String, onClick: () -> Unit) {
    error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
    PrimaryButton(label, onClick = onClick, loading = saving)
}

private const val EXISTING = "existing"
private const val NEW = "new"
