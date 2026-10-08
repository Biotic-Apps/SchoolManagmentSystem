package com.schoolapp.feature.timetable.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.automirrored.outlined.FactCheck
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.ScheduleRow

/** Quick actions a role may take from a lesson; null hides the button. */
data class LessonActions(val onMarkAttendance: (() -> Unit)? = null, val onWriteDiary: (() -> Unit)? = null)

/** Lesson details: subject, time, class, teacher, room, and the role's quick actions. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun LessonSheet(row: ScheduleRow, actions: LessonActions, onDismiss: () -> Unit) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = AppColors.Surface,
    ) {
        Column(
            Modifier.fillMaxWidth().navigationBarsPadding().padding(start = 24.dp, end = 24.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(row.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
            KeyValueRow(stringResource(R.string.timetable_lesson_time), periodCaption(row))
            row.section?.let { KeyValueRow(stringResource(R.string.timetable_lesson_class), it) }
            row.teacher?.takeIf { row.section == null }?.let { KeyValueRow(stringResource(R.string.timetable_lesson_teacher), it) }
            row.room?.let { KeyValueRow(stringResource(R.string.timetable_lesson_room), it) }
            val attendance = actions.onMarkAttendance
            val diary = actions.onWriteDiary
            if (attendance != null || diary != null) {
                Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    attendance?.let {
                        PrimaryButton(
                            text = stringResource(R.string.timetable_mark_attendance),
                            onClick = it,
                            leadingIcon = Icons.AutoMirrored.Outlined.FactCheck,
                            modifier = Modifier.weight(1f),
                        )
                    }
                    diary?.let {
                        SecondaryButton(
                            text = stringResource(R.string.timetable_write_diary),
                            onClick = it,
                            leadingIcon = Icons.Outlined.EditNote,
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
        }
    }
}
