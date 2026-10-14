package com.schoolapp.feature.settings.support

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn

/** Settings › Support (super admin): system health, test message, failed notifications and background jobs. */
@Composable
internal fun SupportTab(schoolId: String, canEdit: Boolean, showHealth: Boolean, modifier: Modifier = Modifier) {
    val healthVm: SupportHealthViewModel = hiltViewModel(key = "support_health")
    val notificationsVm: FailedNotificationsViewModel = hiltViewModel(key = "support_notifications_$schoolId")
    val jobsVm: JobsViewModel = hiltViewModel(key = "support_jobs")
    LaunchedEffect(schoolId) { notificationsVm.bind(schoolId) }
    val health by healthVm.uiState.collectAsStateWithLifecycle()
    val notifications by notificationsVm.uiState.collectAsStateWithLifecycle()
    val jobs by jobsVm.uiState.collectAsStateWithLifecycle()

    RefreshBox(
        isRefreshing = false,
        onRefresh = {
            if (showHealth) healthVm.loadHealth()
            notificationsVm.reload()
            jobsVm.reload()
        },
        modifier = modifier,
    ) {
        ScreenColumn {
            if (showHealth) {
                item(key = "health") { HealthCard(health, onRefresh = healthVm::loadHealth) }
                if (canEdit) {
                    item(key = "test_message") {
                        TestMessageCard(health, onChannel = healthVm::setChannel, onTo = healthVm::setTo, onSend = healthVm::send)
                    }
                }
            }
            failedNotificationItems(notifications, canEdit, notificationsVm)
            jobItems(jobs, canEdit, jobsVm)
        }
    }
    FailedNotificationsDialogs(notifications, notificationsVm)
    jobs.detail?.let { job ->
        JobDetailSheet(
            job = job,
            canRetry = canEdit && job.status == STATUS_FAILED,
            retrying = jobs.retryingId == job.id,
            onRetry = { jobsVm.retry(job.id) },
            onDismiss = { jobsVm.showDetail(null) },
        )
    }
}

internal const val STATUS_FAILED = "FAILED"
