package com.schoolapp.core.model.dashboard

import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.notice.Notice

/** Parent home (`/dashboard/child-today`); [attendance] null = not marked yet. */
data class ChildToday(
    val attendance: AttendanceStatus?,
    val diary: List<DiaryEntry>,
    val notices: List<Notice>,
    val consentsPending: Int,
    val nextMeeting: Meeting?,
)
