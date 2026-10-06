package com.schoolapp.feature.complaints.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.detail.ComplainantDisplay
import com.schoolapp.feature.complaints.detail.ComplaintDetailUi

/** Complainant ("Anonymous" when hidden), against, student, assignee and filed time. */
@Composable
internal fun ComplaintPeopleCard(detail: ComplaintDetailUi, modifier: Modifier = Modifier) {
    val complaint = detail.complaint
    val complainant = when (val person = detail.complainant) {
        ComplainantDisplay.Anonymous -> stringResource(R.string.complaints_anonymous_person)
        is ComplainantDisplay.Named -> listOfNotNull(person.name, person.role?.let(::humanizeKey)).joinToString(" · ")
    }
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            KeyValueRow(stringResource(R.string.complaints_complainant), complainant)
            complaint.against?.let { KeyValueRow(stringResource(R.string.complaints_against), it.name) }
            complaint.student?.let { KeyValueRow(stringResource(R.string.complaints_student), it.name) }
            KeyValueRow(stringResource(R.string.complaints_assignee), complaint.assignee?.name ?: stringResource(R.string.complaints_unassigned))
            formatTimestamp(complaint.createdAt)?.let { KeyValueRow(stringResource(R.string.complaints_created), it) }
        }
    }
}
