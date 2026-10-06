package com.schoolapp.demo

import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus
import kotlinx.coroutines.flow.MutableStateFlow

/** Two published notices; the parent-teacher meeting one is pinned. */
internal object DemoNoticesData {

    val notices = MutableStateFlow(seed())

    private fun seed(): List<Notice> {
        val today = DemoDates.today()
        val yesterday = DemoDates.previousSchoolDays(1).first()
        return listOf(
            Notice(
                "demo-nt-1", "Parent-teacher meetings this week",
                "Class teachers are available for 20-minute meetings after school. Please book a slot from the Meetings screen.",
                NoticeStatus.PUBLISHED, pinned = true, publishedAt = DemoDates.iso(yesterday, "09:00"),
                expiresOn = today.plusDays(6).toString(), authorName = DemoActors.principal.name,
                audienceLabel = "Whole branch", isRead = false,
            ),
            Notice(
                "demo-nt-2", "Annual Sports Day",
                "Sports Day will be held on ${today.plusDays(7)}. Please give consent in the app by ${today.plusDays(3)}.",
                NoticeStatus.PUBLISHED, pinned = false, publishedAt = DemoDates.iso(today, "08:10"),
                expiresOn = today.plusDays(7).toString(), authorName = DemoActors.principal.name,
                audienceLabel = "Whole branch", isRead = true,
            ),
        )
    }
}
