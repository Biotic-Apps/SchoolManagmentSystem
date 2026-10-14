package com.schoolapp.feature.pickup.persons

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.feature.pickup.R
import com.schoolapp.feature.pickup.components.StudentResultRow

/** The looked-up student with a "Change" action that returns to the search. */
@Composable
internal fun SelectedStudentCard(student: StudentSummary, onChange: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        Column {
            StudentResultRow(student, onClick = onChange)
            Box(Modifier.fillMaxWidth().padding(end = 8.dp, bottom = 4.dp), contentAlignment = Alignment.CenterEnd) {
                AppTextButton(stringResource(R.string.pickup_change_student), onChange)
            }
        }
    }
}
