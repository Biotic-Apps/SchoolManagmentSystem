package com.schoolapp.feature.messages.newthread.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.messages.R

@Composable
internal fun SelectedStudentCard(student: StudentSummary, onChange: () -> Unit, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.messages_student))
        AppCard(contentPadding = 0.dp) {
            StudentLine(student, trailing = { AppTextButton(stringResource(R.string.messages_change), onChange) })
        }
    }
}
