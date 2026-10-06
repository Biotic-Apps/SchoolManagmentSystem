package com.schoolapp.feature.attendance.register.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.attendanceStatusLabel
import com.schoolapp.feature.attendance.register.CorrectionEditor

/** Locked register: ask the principal to change one student's mark (old value stays in history). */
@Composable
internal fun CorrectionSheet(
    editor: CorrectionEditor,
    onStatusChange: (AttendanceStatus) -> Unit,
    onReasonChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    AppBottomSheet(title = stringResource(R.string.attendance_correction_title), onDismiss = onDismiss) {
        SectionHeader(title = editor.studentName)
        KeyValueRow(stringResource(R.string.attendance_correction_current), attendanceStatusLabel(editor.current))
        editor.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        SectionHeader(title = stringResource(R.string.attendance_correction_new))
        FilterChipRow(
            options = AttendanceStatus.entries.filter { it != editor.current }.map { SwitcherOption(it.name, attendanceStatusLabel(it)) },
            selectedId = editor.newStatus?.name,
            onSelect = { onStatusChange(AttendanceStatus.valueOf(it)) },
        )
        if (editor.statusMissing) InlineMessage(stringResource(R.string.attendance_correction_status_required), StatusTone.Error)
        AppTextArea(
            value = editor.reason,
            onValueChange = onReasonChange,
            label = stringResource(R.string.attendance_correction_reason),
            enabled = !editor.isSaving,
            errorText = if (editor.reasonMissing) stringResource(R.string.attendance_correction_reason_required) else null,
        )
        PrimaryButton(stringResource(R.string.attendance_correction_send), onSubmit, loading = editor.isSaving)
    }
}
