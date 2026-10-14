package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Close
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.feature.admissions.R

private enum class Step(val label: Int) {
    SUBMITTED(R.string.admissions_step_submitted),
    DOCUMENTS(R.string.admissions_step_documents),
    TEST_SCHEDULED(R.string.admissions_step_test_scheduled),
    TEST_COMPLETED(R.string.admissions_step_test_completed),
    DECISION(R.string.admissions_step_decision),
    CONFIRMED(R.string.admissions_step_confirmed),
    ENROLLED(R.string.admissions_step_enrolled),
}

/** Where the application is in the pipeline: done steps ticked, current highlighted, a closed one marked. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ApplicationStepper(app: AdmissionApplication, modifier: Modifier = Modifier) {
    val current = currentStep(app)
    val failed = app.status in setOf(ApplicationStatus.REJECTED, ApplicationStatus.EXPIRED, ApplicationStatus.WITHDRAWN)
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.admissions_progress))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Step.entries.forEach { step ->
                val label = if (step == Step.DECISION) decisionLabel(app) else stringResource(step.label)
                when {
                    step.ordinal < current.ordinal -> StatusChip(label, StatusTone.Success, icon = Icons.Outlined.Check)
                    step == current && failed -> StatusChip(statusLabel(app.status), StatusTone.Error, icon = Icons.Outlined.Close)
                    step == current -> StatusChip(label, StatusTone.Info)
                    else -> StatusChip(label, StatusTone.Neutral)
                }
            }
        }
    }
}

@Composable
private fun decisionLabel(app: AdmissionApplication): String = when (app.status) {
    ApplicationStatus.WAITLISTED -> app.waitlistPosition?.let { stringResource(R.string.admissions_step_waitlisted_n, it) }
        ?: stringResource(R.string.admissions_step_waitlisted)
    ApplicationStatus.OFFERED, ApplicationStatus.CONFIRMED, ApplicationStatus.ENROLLED -> stringResource(R.string.admissions_step_offered)
    else -> stringResource(R.string.admissions_step_decision)
}

@Composable
private fun statusLabel(status: ApplicationStatus): String = stringResource(
    when (status) {
        ApplicationStatus.REJECTED -> R.string.admissions_step_rejected
        ApplicationStatus.EXPIRED -> R.string.admissions_step_expired
        else -> R.string.admissions_step_withdrawn
    },
)

private fun currentStep(app: AdmissionApplication): Step = when (app.status) {
    ApplicationStatus.SUBMITTED -> Step.SUBMITTED
    ApplicationStatus.DOCUMENTS_PENDING -> Step.DOCUMENTS
    ApplicationStatus.TEST_SCHEDULED -> Step.TEST_SCHEDULED
    ApplicationStatus.TEST_COMPLETED -> Step.TEST_COMPLETED
    ApplicationStatus.OFFERED, ApplicationStatus.WAITLISTED, ApplicationStatus.REJECTED, ApplicationStatus.EXPIRED -> Step.DECISION
    ApplicationStatus.CONFIRMED -> Step.CONFIRMED
    ApplicationStatus.ENROLLED -> Step.ENROLLED
    // A withdrawal does not record where it happened, so infer the furthest step from the data.
    else -> when {
        app.waitlistPosition != null || app.decisionReason != null -> Step.DECISION
        app.test?.score != null -> Step.TEST_COMPLETED
        app.test != null -> Step.TEST_SCHEDULED
        app.documentCount > 0 -> Step.DOCUMENTS
        else -> Step.SUBMITTED
    }
}
