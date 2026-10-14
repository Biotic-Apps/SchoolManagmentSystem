package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionTest
import com.schoolapp.core.model.admissions.ApplicantGuardian
import com.schoolapp.core.model.admissions.MedicalInfo
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.admissions.R

@Composable
internal fun ApplicationSummaryCard(app: AdmissionApplication, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = app.childName,
            subtitle = app.applicationNo,
            action = { StatusChip(humanizeKey(app.status.name), statusTone(app.status.name)) },
        )
        KeyValueRow(stringResource(R.string.admissions_class), app.className)
        KeyValueRow(stringResource(R.string.admissions_applied_on), formatDate(app.createdAt))
        KeyValueRow(stringResource(R.string.admissions_dob), formatDate(app.dob))
        KeyValueRow(stringResource(R.string.admissions_gender), app.gender?.let(::humanizeKey))
        app.child?.bForm?.takeIf { it.isNotBlank() }?.let { KeyValueRow(stringResource(R.string.admissions_bform), it) }
        KeyValueRow(stringResource(R.string.admissions_previous_school), app.previousSchool)
        app.child?.address?.takeIf { it.isNotBlank() }?.let { KeyValueRow(stringResource(R.string.admissions_address), it) }
        app.notes?.takeIf { it.isNotBlank() }?.let { KeyValueRow(stringResource(R.string.admissions_new_notes), it) }
        app.waitlistPosition?.let { KeyValueRow(stringResource(R.string.admissions_waitlist_position), it.toString()) }
        app.decisionReason?.let { KeyValueRow(stringResource(R.string.admissions_decision_reason), it) }
    }
}

@Composable
internal fun ApplicantGuardiansCard(guardians: List<ApplicantGuardian>, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_guardians))
        if (guardians.isEmpty()) {
            Text(stringResource(R.string.admissions_no_guardians), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        guardians.forEach { g ->
            val label = listOfNotNull(g.name, g.relation?.let(::humanizeKey)).joinToString(" · ") +
                if (g.isPrimary) " · " + stringResource(R.string.admissions_primary) else ""
            val cnic = g.cnic?.takeIf { it.isNotBlank() }?.let { stringResource(R.string.admissions_cnic_value, it) }
            val details = listOfNotNull(g.phone, g.email, cnic, g.occupation, g.address).filter { it.isNotBlank() }
            KeyValueRow(label, details.joinToString("\n").ifBlank { null })
        }
    }
}

@Composable
internal fun MedicalInfoCard(medical: MedicalInfo?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_medical))
        KeyValueRow(stringResource(R.string.admissions_allergies), medical?.allergies?.ifBlank { null })
        KeyValueRow(stringResource(R.string.admissions_conditions), medical?.conditions?.ifBlank { null })
        KeyValueRow(stringResource(R.string.admissions_medical_notes), medical?.notes?.ifBlank { null })
    }
}

@Composable
internal fun AdmissionTestCard(test: AdmissionTest, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_test))
        KeyValueRow(stringResource(R.string.admissions_test_at), formatTimestamp(test.scheduledAt))
        KeyValueRow(stringResource(R.string.admissions_test_venue), test.venue)
        val score = test.score?.let { s -> listOfNotNull(s.trimmed(), test.maxScore?.trimmed()).joinToString(" / ") }
        KeyValueRow(stringResource(R.string.admissions_test_score), score ?: stringResource(R.string.admissions_test_not_recorded))
        KeyValueRow(stringResource(R.string.admissions_test_remarks), test.remarks)
    }
}

internal fun Double.trimmed(): String = if (this % 1.0 == 0.0) toLong().toString() else toString()
