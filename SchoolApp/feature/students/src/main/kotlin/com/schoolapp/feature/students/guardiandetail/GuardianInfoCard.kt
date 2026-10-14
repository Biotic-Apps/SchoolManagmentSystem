package com.schoolapp.feature.students.guardiandetail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.guardians.GuardianDetail
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

/** The guardian record (CNIC comes masked). */
@Composable
internal fun GuardianInfoCard(detail: GuardianDetail) {
    val guardian = detail.guardian
    AppCard(Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(title = stringResource(R.string.students_guardian_details))
        KeyValueRow(stringResource(R.string.students_relation), guardian.relation?.let(::humanizeKey))
        KeyValueRow(stringResource(R.string.students_phone), guardian.phone)
        guardian.email?.let { KeyValueRow(stringResource(R.string.students_email_label), it) }
        detail.cnic?.let { KeyValueRow(stringResource(R.string.students_cnic), it) }
        guardian.occupation?.let { KeyValueRow(stringResource(R.string.students_occupation), it) }
        guardian.address?.let { KeyValueRow(stringResource(R.string.students_address_label), it) }
    }
}
