package com.schoolapp.feature.dashboard.supervisor

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.FactCheck
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.automirrored.outlined.DirectionsWalk
import androidx.compose.material.icons.outlined.EventBusy
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material.icons.outlined.Insights
import androidx.compose.material.icons.outlined.PersonOff
import androidx.compose.material.icons.outlined.ReportProblem
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.material.icons.outlined.Timer
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.navigation.LeaveReviewDestination
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.dashboard.DashboardLink
import com.schoolapp.feature.dashboard.R

/** One "Today" queue count; [labelRes] null = a key added by a later API version (humanized). */
@Immutable
data class PendingTile(
    val key: String,
    val labelRes: Int?,
    val icon: ImageVector,
    val count: Long,
    val tone: StatusTone,
    val link: DashboardLink?,
)

private data class TileSpec(val labelRes: Int, val icon: ImageVector, val alertTone: StatusTone, val link: DashboardLink?)

private val Specs: Map<String, TileSpec> = linkedMapOf(
    "unmarkedAttendance" to TileSpec(
        R.string.dashboard_pending_unmarked_attendance, Icons.AutoMirrored.Outlined.FactCheck, StatusTone.Error,
        DashboardLink.Menu(MenuIds.ATTENDANCE),
    ),
    "missingDiaries" to TileSpec(
        R.string.dashboard_pending_missing_diaries, Icons.AutoMirrored.Outlined.MenuBook, StatusTone.Warning,
        DashboardLink.Menu(MenuIds.DIARY),
    ),
    "pendingApprovals" to TileSpec(
        R.string.dashboard_pending_approvals, Icons.Outlined.TaskAlt, StatusTone.Warning, DashboardLink.Menu(MenuIds.APPROVALS),
    ),
    "pendingLeave" to TileSpec(
        R.string.dashboard_pending_leave, Icons.Outlined.EventBusy, StatusTone.Warning, DashboardLink.Screen(LeaveReviewDestination),
    ),
    "openComplaints" to TileSpec(
        R.string.dashboard_pending_open_complaints, Icons.Outlined.ReportProblem, StatusTone.Warning,
        DashboardLink.Menu(MenuIds.COMPLAINTS),
    ),
    "overdueComplaints" to TileSpec(
        R.string.dashboard_pending_overdue_complaints, Icons.Outlined.Timer, StatusTone.Error, DashboardLink.Menu(MenuIds.COMPLAINTS),
    ),
    "todayIncidents" to TileSpec(
        R.string.dashboard_pending_incidents, Icons.Outlined.HealthAndSafety, StatusTone.Error, DashboardLink.Menu(MenuIds.HEALTH),
    ),
    "earlyLeavesToday" to TileSpec(
        R.string.dashboard_pending_early_leaves, Icons.AutoMirrored.Outlined.DirectionsWalk, StatusTone.Warning, DashboardLink.Menu(MenuIds.PICKUP),
    ),
    "staffAbsentToday" to TileSpec(R.string.dashboard_pending_staff_absent, Icons.Outlined.PersonOff, StatusTone.Warning, DashboardLink.Menu(MenuIds.ATTENDANCE)),
)

/** Known keys in a fixed order (unknown ones last); zero counts are neutral, others take the key's alert tone. */
internal fun pendingTiles(metrics: List<DashboardMetric>): List<PendingTile> {
    val order = Specs.keys.toList()
    return metrics
        .sortedBy { metric -> order.indexOf(metric.key).let { if (it < 0) Int.MAX_VALUE else it } }
        .map { metric ->
            val spec = Specs[metric.key]
            PendingTile(
                key = metric.key,
                labelRes = spec?.labelRes,
                icon = spec?.icon ?: Icons.Outlined.Insights,
                count = metric.count,
                tone = if (metric.count == 0L) StatusTone.Neutral else spec?.alertTone ?: StatusTone.Warning,
                link = spec?.link,
            )
        }
}
