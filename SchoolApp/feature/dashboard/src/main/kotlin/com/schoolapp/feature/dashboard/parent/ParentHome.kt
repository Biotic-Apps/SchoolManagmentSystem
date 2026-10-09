package com.schoolapp.feature.dashboard.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.dashboard.AttendanceMonth
import com.schoolapp.core.model.dashboard.ChildBrief
import com.schoolapp.core.model.dashboard.HomeworkDue
import com.schoolapp.core.model.dashboard.LatestResult
import com.schoolapp.core.model.dashboard.ParentOverview
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.feature.dashboard.TodayPeriod
import com.schoolapp.feature.dashboard.todayPeriods
import java.time.LocalDateTime

/** The active child's home; [attendance] null = not marked yet (never shown as absent); [fees] null hides the fee tile. */
@Immutable
data class ParentHome(
    val child: ChildBrief,
    val attendance: AttendanceStatus?,
    val month: AttendanceMonth?,
    val fees: FeeSummary?,
    val latestResult: LatestResult?,
    val homework: HomeworkDue,
    val periods: List<TodayPeriod>,
    val diary: List<DiaryEntry>,
    val notices: List<Notice>,
    val meetings: List<Meeting>,
    val events: List<CalendarEvent>,
    val consentsPending: Int,
) {
    companion object {
        const val NOTICE_LIMIT = 3
        const val DIARY_LIMIT = 5

        /** Pinned notices first (server order kept otherwise); periods carry the teacher and the running one is marked. */
        fun from(overview: ParentOverview, now: LocalDateTime) = ParentHome(
            child = overview.child,
            attendance = overview.attendance.today,
            month = overview.attendance.month,
            fees = overview.fees,
            latestResult = overview.latestResult,
            homework = overview.homework,
            periods = parentPeriods(overview, now),
            diary = overview.diary.take(DIARY_LIMIT),
            notices = overview.notices.sortedByDescending { it.pinned }.take(NOTICE_LIMIT),
            meetings = overview.meetings,
            events = overview.events,
            consentsPending = overview.consentsPending,
        )

        /** Same timing marks as the teacher's day, but the subtitle names the teacher instead of the section. */
        private fun parentPeriods(overview: ParentOverview, now: LocalDateTime): List<TodayPeriod> {
            val slots = overview.todayPeriods.sortedBy { it.periodIndex }
            return todayPeriods(slots, now).zip(slots) { period, slot -> period.copy(subtitle = slot.staffName) }
        }
    }
}
