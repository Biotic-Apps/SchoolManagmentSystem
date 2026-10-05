package com.schoolapp.core.data

import com.schoolapp.core.data.dashboard.toMetrics
import com.schoolapp.core.data.organisation.toSettings
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.organisation.BranchSetting
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import org.junit.Assert.assertEquals
import org.junit.Test

class MappersTest {

    private fun obj(raw: String) = Json.parseToJsonElement(raw) as JsonObject

    @Test
    fun dashboard_keeps_numeric_counts_including_future_keys() {
        val metrics = obj("""{"schools":1,"branches":2,"fees":{"x":1},"newModule":7}""").toMetrics()
        assertEquals(
            listOf(DashboardMetric("schools", 1), DashboardMetric("branches", 2), DashboardMetric("newModule", 7)),
            metrics,
        )
    }

    @Test
    fun branch_settings_are_flattened_for_display() {
        val settings = obj(
            """{"diary.moderation":false,"attendance.lockTime":"11:00","messaging.officeHours":{"from":"08:00","to":"16:00"},"approval.limits":{}}""",
        ).toSettings()
        assertEquals(
            listOf(
                BranchSetting("approval.limits", "-"),
                BranchSetting("attendance.lockTime", "11:00 AM"),
                BranchSetting("diary.moderation", "Off"),
                BranchSetting("messaging.officeHours", "from: 8:00 AM, to: 4:00 PM"),
            ),
            settings,
        )
    }
}
