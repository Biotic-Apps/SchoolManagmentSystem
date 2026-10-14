package com.schoolapp.feature.attendance.leave

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.attachments.AttachmentsField
import com.schoolapp.feature.attendance.R

/** Body of the request form: who approves, leave type (staff), dates, reason with counter, optional document. */
@Composable
internal fun LeaveRequestForm(
    form: LeaveForm,
    isChild: Boolean,
    today: String,
    callbacks: LeaveFormCallbacks,
    modifier: Modifier = Modifier,
) {
    val enabled = !form.isSaving
    ScreenColumn(modifier, itemSpacing = 20.dp) {
        item(key = "approver") {
            InlineMessage(
                stringResource(if (isChild) R.string.leave_form_approver_parent else R.string.leave_form_approver_staff),
                StatusTone.Info,
            )
        }
        form.error?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        form.type?.let { selected ->
            item(key = "type") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SectionHeader(title = stringResource(R.string.leave_form_type_header))
                    LeaveTypeSelector(selected, callbacks.onTypeChange, enabled)
                }
            }
        }
        item(key = "dates") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(
                    title = stringResource(if (isChild) R.string.leave_form_dates_header_child else R.string.leave_form_dates_header),
                )
                LeaveDateRangeCard(form, today, callbacks.onFromChange, callbacks.onToChange, enabled)
            }
        }
        item(key = "reason") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                SectionHeader(title = stringResource(R.string.leave_form_reason_header))
                LeaveReasonField(form, callbacks.onReasonChange, enabled)
            }
        }
        item(key = "attachment") {
            AttachmentsField(
                draft = form.attachments,
                onPicked = callbacks.onAttach,
                onRemove = callbacks.onRemoveAttachment,
                label = stringResource(R.string.leave_form_attachment),
                max = LeaveForm.MAX_ATTACHMENTS,
                enabled = enabled,
            )
        }
    }
}
