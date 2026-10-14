package com.schoolapp.feature.students.transfers

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.add.SectionOption

/** Accept (pick a section) or reject / cancel (reason) sheet for a transfer. */
@Composable
internal fun TransferSheetHost(sheet: TransferSheet, sections: List<SectionOption>, viewModel: TransfersViewModel) {
    when (sheet) {
        is TransferSheet.Accept -> AppBottomSheet(stringResource(R.string.students_accept_transfer_title, sheet.transfer.studentName), viewModel::closeSheet) {
            InlineMessage(stringResource(R.string.students_accept_transfer_hint), StatusTone.Info)
            CreatablePickerField(
                label = stringResource(R.string.students_add_section),
                options = sections.map { section ->
                    val seats = section.capacity?.let { stringResource(R.string.students_seats, section.studentCount, it) }
                    PickerOption(
                        section.id, section.label,
                        listOfNotNull(seats, stringResource(R.string.students_full).takeIf { section.isFull }).joinToString(" · "),
                        muted = section.isFull,
                    )
                },
                selectedId = sheet.sectionId,
                onSelect = { it?.let(viewModel::onSection) },
                errorText = if (sheet.sectionMissing) stringResource(R.string.students_pick_section) else null,
            )
            if (sections.isEmpty()) InlineMessage(stringResource(R.string.students_add_no_sections), StatusTone.Warning)
            if (sections.firstOrNull { it.id == sheet.sectionId }?.isFull == true) {
                InlineMessage(stringResource(R.string.students_section_full_warning), StatusTone.Warning)
            }
            sheet.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
            PrimaryButton(stringResource(R.string.students_accept), viewModel::submit, Modifier.fillMaxWidth(), loading = sheet.saving)
        }
        is TransferSheet.Close -> {
            val rejecting = sheet.action == CloseAction.REJECT
            AppBottomSheet(
                stringResource(if (rejecting) R.string.students_reject_transfer_title else R.string.students_cancel_transfer_title, sheet.transfer.studentName),
                viewModel::closeSheet,
            ) {
                InlineMessage(
                    stringResource(if (rejecting) R.string.students_reject_transfer_hint else R.string.students_cancel_transfer_hint),
                    StatusTone.Warning,
                )
                AppTextArea(
                    value = sheet.reason,
                    onValueChange = viewModel::onReason,
                    label = stringResource(R.string.students_reason),
                    errorText = if (sheet.reasonError) stringResource(R.string.students_reason_min) else null,
                )
                sheet.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
                PrimaryButton(
                    stringResource(if (rejecting) R.string.students_reject_transfer else R.string.students_cancel_transfer),
                    viewModel::submit, Modifier.fillMaxWidth(), loading = sheet.saving,
                )
            }
        }
    }
}
