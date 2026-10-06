package com.schoolapp.demo

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.dashboard.ChildToday
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.dashboard.PendingDiarySlot
import com.schoolapp.core.model.dashboard.SectionRegisterState
import com.schoolapp.core.model.dashboard.TeacherToday
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.pickup.EarlyLeaveStatus

/** Dashboard numbers computed from the other demo stores so counts match the screens. */
internal object DemoDashboardData {

    fun pending(date: String): List<DashboardMetric> {
        val complaints = DemoComplaintsData.complaints.value.map { it.complaint }
        val approvals = (DemoPhase2Approvals.items + DemoData.approvals).count { it.status == ApprovalStatus.PENDING }
        val delayed = DemoSyllabusData.plans.sumOf { plan -> plan.chapters.sumOf { ch -> ch.topics.count { it.isDelayed } } }
        return listOf(
            DashboardMetric("unmarkedAttendance", DemoAwareAttendanceRepository.demoUnmarked(date).size.toLong()),
            DashboardMetric("missingDiaries", DemoAwareDiaryRepository.demoMissing(date).size.toLong()),
            DashboardMetric("pendingApprovals", approvals.toLong()),
            DashboardMetric("pendingLeave", DemoLeaveData.leaves.value.count { it.status == LeaveStatus.SUBMITTED }.toLong()),
            DashboardMetric("openComplaints", complaints.count { it.isOpen }.toLong()),
            DashboardMetric("overdueComplaints", complaints.count { it.overdue && it.isOpen }.toLong()),
            DashboardMetric("delayedTopics", delayed.toLong()),
            DashboardMetric("todayIncidents", DemoAwareHealthRepository.demoIncidents(null, date, date).size.toLong()),
            DashboardMetric(
                "earlyLeavesToday",
                DemoPickupData.earlyLeaves.value.count { it.date == date && it.status != EarlyLeaveStatus.REJECTED }.toLong(),
            ),
            DashboardMetric("staffAbsentToday", 1),
        )
    }

    /** Demo Teacher's day: Maths periods, 5-A / 5-B registers, unpublished own diaries, unread threads, assigned complaints. */
    fun teacherToday(role: RoleRef?): TeacherToday {
        val today = DemoDates.today()
        val date = today.toString()
        val sections = if (role == RoleKey.HELPER) listOf("demo-sec-5a") else DemoDiaryData.classSections
        val periods = DemoTimetableData.teacherWeek.filter { it.day == today.dayOfWeek.value }.map { it.copy(date = date) }
        val registers = sections.map { SectionRegisterState(it, DemoActors.sectionLabel(it), DemoAttendanceData.register(it, date).status) }
        val diaries = sections.filterNot { sectionId ->
            DemoDiaryData.entries.value.any {
                it.sectionId == sectionId && it.subjectId == DemoDiaryData.MATHS && it.date == date && it.status == DiaryStatus.PUBLISHED
            }
        }.map { PendingDiarySlot(it, DemoActors.sectionLabel(it), DemoDiaryData.MATHS, DemoDiaryData.subjectName(DemoDiaryData.MATHS)) }
        val unread = DemoMessagesData.threads.value.sumOf { it.unreadForStaff }
        val assigned = DemoComplaintsData.complaints.value.count {
            it.complaint.assignee == DemoActors.teacher && it.complaint.isOpen && it.complaint.status != ComplaintStatus.ESCALATED
        }
        return TeacherToday(periods, registers, diaries, unread, assigned)
    }

    fun childToday(studentId: String): ChildToday {
        val date = DemoDates.todayKey()
        val sectionId = DemoPeopleData.students.firstOrNull { it.id == studentId }?.sectionId
        val register = sectionId?.let { DemoAttendanceData.register(it, date) }
        val attendance = register?.takeIf { it.status.isFinal }?.entries?.firstOrNull { it.studentId == studentId }?.status
        val diary = DemoDiaryData.entries.value.filter { it.sectionId == sectionId && it.date == date && it.status == DiaryStatus.PUBLISHED }
        val consents = DemoAwareActivitiesRepository.demoForChild(studentId).count { it.myConsent == ConsentStatus.PENDING }
        return ChildToday(
            attendance = attendance,
            diary = diary.sortedBy { it.subjectName },
            notices = DemoAwareNoticesRepository.demoVisible().take(2),
            consentsPending = consents,
            nextMeeting = DemoAwareMeetingsRepository.demoMeetings(MeetingBox.UPCOMING, studentId).firstOrNull(),
        )
    }
}
