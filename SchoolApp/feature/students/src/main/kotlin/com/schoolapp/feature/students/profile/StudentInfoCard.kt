package com.schoolapp.feature.students.profile

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

@Composable
internal fun StudentInfoCard(detail: StudentDetail, modifier: Modifier = Modifier) {
    val student = detail.summary
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.students_profile))
        KeyValueRow(stringResource(R.string.students_admission_no), student.admissionNo)
        KeyValueRow(stringResource(R.string.students_dob), formatDate(student.dob))
        KeyValueRow(stringResource(R.string.students_gender), student.gender?.let(::humanizeKey))
        KeyValueRow(stringResource(R.string.students_bform), detail.bForm)
        KeyValueRow(stringResource(R.string.students_admission_date), formatDate(detail.admissionDate))
        KeyValueRow(stringResource(R.string.students_address), detail.address)
    }
}
