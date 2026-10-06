package com.schoolapp.feature.dashboard.parent

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.dashboard.ChildToday
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.notice.Notice

/** The active child's day; [attendance] null = not marked yet (never shown as absent). */
@Immutable
data class ParentHome(
    val attendance: AttendanceStatus?,
    val diary: List<DiaryEntry>,
    val notices: List<Notice>,
    val consentsPending: Int,
    val nextMeeting: Meeting?,
) {
    companion object {
        const val NOTICE_LIMIT = 3

        /** Pinned notices first (server order kept otherwise), at most [NOTICE_LIMIT]. */
        fun from(today: ChildToday) = ParentHome(
            attendance = today.attendance,
            diary = today.diary,
            notices = today.notices.sortedByDescending { it.pinned }.take(NOTICE_LIMIT),
            consentsPending = today.consentsPending,
            nextMeeting = today.nextMeeting,
        )
    }
}
