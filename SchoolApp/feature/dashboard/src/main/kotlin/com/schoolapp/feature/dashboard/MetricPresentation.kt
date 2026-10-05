package com.schoolapp.feature.dashboard

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Insights
import androidx.compose.material.icons.outlined.Layers
import androidx.compose.material.icons.outlined.ManageAccounts
import androidx.compose.material.icons.outlined.School
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.navigation.MenuIds

/** How a summary key is shown; unknown keys from later phases fall back to a generic tile. */
internal data class MetricPresentation(
    val labelRes: Int?,
    val icon: ImageVector,
    val tone: StatusTone,
    val menuId: String?,
)

internal fun presentationFor(key: String): MetricPresentation = when (key) {
    "schools" -> MetricPresentation(R.string.dashboard_metric_schools, Icons.Outlined.School, StatusTone.Info, MenuIds.SCHOOLS)
    "branches" -> MetricPresentation(R.string.dashboard_metric_branches, Icons.Outlined.Apartment, StatusTone.Info, MenuIds.BRANCHES)
    "users" -> MetricPresentation(R.string.dashboard_metric_users, Icons.Outlined.ManageAccounts, StatusTone.Neutral, MenuIds.USERS)
    "activeSessions" -> MetricPresentation(
        R.string.dashboard_metric_sessions, Icons.Outlined.CalendarMonth, StatusTone.Success, MenuIds.SESSIONS,
    )
    "sections" -> MetricPresentation(R.string.dashboard_metric_sections, Icons.Outlined.Layers, StatusTone.Neutral, MenuIds.CLASSES)
    "pendingApprovals" -> MetricPresentation(
        R.string.dashboard_metric_approvals, Icons.Outlined.TaskAlt, StatusTone.Warning, MenuIds.APPROVALS,
    )
    else -> MetricPresentation(null, Icons.Outlined.Insights, StatusTone.Neutral, null)
}
