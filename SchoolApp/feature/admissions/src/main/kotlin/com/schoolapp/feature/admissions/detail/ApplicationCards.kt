package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionTest
import com.schoolapp.core.model.admissions.ApplicantGuardian
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
        KeyValueRow(stringResource(R.string.admissions_dob), formatDate(app.dob))
        KeyValueRow(stringResource(R.string.admissions_gender), app.gender?.let(::humanizeKey))
        KeyValueRow(stringResource(R.string.admissions_previous_school), app.previousSchool)
        KeyValueRow(stringResource(R.string.admissions_applied_on), formatDate(app.createdAt))
        KeyValueRow(stringResource(R.string.admissions_documents), app.documentCount.toString())
        app.waitlistPosition?.let { KeyValueRow(stringResource(R.string.admissions_waitlist_position), it.toString()) }
        app.decisionReason?.let { KeyValueRow(stringResource(R.string.admissions_decision_reason), it) }
    }
}

@Composable
internal fun ApplicantGuardiansCard(guardians: List<ApplicantGuardian>, modifier: Modifier = Modifier) {
    if (guardians.isEmpty()) return
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_guardians))
        guardians.forEach { g ->
            val label = listOfNotNull(g.name, g.relation?.let(::humanizeKey)).joinToString(" · ") +
                if (g.isPrimary) " · " + stringResource(R.string.admissions_primary) else ""
            KeyValueRow(label, g.phone)
        }
    }
}

@Composable
internal fun AdmissionTestCard(test: AdmissionTest, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_test))
        KeyValueRow(stringResource(R.string.admissions_test_at), formatTimestamp(test.scheduledAt))
        KeyValueRow(stringResource(R.string.admissions_test_venue), test.venue)
        val score = test.score?.let { s -> listOfNotNull(s.trimmed(), test.maxScore?.trimmed()).joinToString(" / ") }
        KeyValueRow(stringResource(R.string.admissions_test_score), score)
        KeyValueRow(stringResource(R.string.admissions_test_remarks), test.remarks)
    }
}

private fun Double.trimmed(): String = if (this % 1.0 == 0.0) toLong().toString() else toString()
