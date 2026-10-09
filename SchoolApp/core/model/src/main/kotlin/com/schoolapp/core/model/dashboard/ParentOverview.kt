package com.schoolapp.core.model.dashboard

import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.timetable.TeacherSlot

/** Parent home for one child (`GET /parent/home`); [fees] null when the parent may not see fees. */
data class ParentOverview(
    val child: ChildBrief,
    val attendance: ChildAttendance,
    val fees: FeeSummary?,
    val latestResult: LatestResult?,
    val homework: HomeworkDue,
    val todayPeriods: List<TeacherSlot>,
    val diary: List<DiaryEntry>,
    val notices: List<Notice>,
    val meetings: List<Meeting>,
    /** [CalendarEvent.type] carries the kind: ACTIVITY, EVENT, HOLIDAY, VACATION or DEADLINE. */
    val events: List<CalendarEvent>,
    val consentsPending: Int,
)
