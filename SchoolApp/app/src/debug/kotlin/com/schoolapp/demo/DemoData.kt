package com.schoolapp.demo

import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import com.schoolapp.core.model.approval.ApprovalStep
import com.schoolapp.core.model.dashboard.DashboardMetric
import com.schoolapp.core.model.notification.AppNotification
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.BranchSetting
import com.schoolapp.core.model.organisation.BranchTimings
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.profile.DeviceSession

/** Fixed sample records for the debug "Preview a role" mode only. */
internal object DemoData {
    const val SCHOOL_ID = "demo-school"
    const val SCHOOL_NAME = "Bright School"
    const val MAIN_BRANCH_ID = "demo-branch-main"
    const val MAIN_BRANCH_NAME = "Main Branch"

    val metrics = listOf(
        DashboardMetric("schools", 1), DashboardMetric("branches", 2), DashboardMetric("users", 24),
        DashboardMetric("activeSessions", 2), DashboardMetric("sections", 4), DashboardMetric("pendingApprovals", 6),
        DashboardMetric("students", 40), DashboardMetric("staff", 7), DashboardMetric("pendingAdmissions", 4),
        DashboardMetric("pendingChildLinks", 1),
    )

    val approvals = listOf(
        ApprovalRequest(
            "demo-ap-1", "LEAVE", "LeaveRequest", "Leave request: 2 days", "demo-u2", "Bilal Ahmed",
            ApprovalStatus.PENDING, 1, "2026-10-04T09:15:00Z",
            listOf(ApprovalStep(1, "PRINCIPAL", null, null, null, null)),
        ),
        ApprovalRequest(
            "demo-ap-2", "ATTENDANCE_CORRECTION", "Attendance", "Attendance correction: Class 5-A", "demo-u3",
            "Sana Iqbal", ApprovalStatus.PENDING, 1, "2026-10-03T11:40:00Z",
            listOf(ApprovalStep(1, "COORDINATOR", null, null, null, null)),
        ),
        ApprovalRequest(
            "demo-ap-3", "EXPENSE", "Expense", "Science lab supplies", "demo-u4", "Usman Raza",
            ApprovalStatus.APPROVED, 1, "2026-09-28T07:30:00Z",
            listOf(ApprovalStep(1, "PRINCIPAL", "APPROVED", "Within budget", "2026-09-29T08:00:00Z", "Demo User")),
        ),
    )

    val notifications = listOf(
        AppNotification("demo-n-1", "APPROVAL", "Leave request needs your decision", "Bilal Ahmed, 2 days", false, "2026-10-05T07:10:00Z"),
        AppNotification("demo-n-2", "APPROVAL", "Attendance correction submitted", "Class 5-A, 3 October", false, "2026-10-04T12:00:00Z"),
        AppNotification("demo-n-3", "SYSTEM", "Welcome to eSchool", "Your account is ready.", true, "2026-10-01T08:00:00Z"),
    )

    private val timings = BranchTimings("08:00", "14:00", "11:00")

    val branches = listOf(
        Branch(
            MAIN_BRANCH_ID, SCHOOL_ID, SCHOOL_NAME, "MAIN", MAIN_BRANCH_NAME, "12 Canal Road, Lahore", "042-1234567",
            "main@brightschool.pk", timings, listOf(1, 2, 3, 4, 5, 6), "Amina Sheikh", "ACTIVE",
        ),
        Branch(
            "demo-branch-city", SCHOOL_ID, SCHOOL_NAME, "CITY", "City Branch", "5 Mall Road, Lahore", "042-7654321",
            "city@brightschool.pk", timings, listOf(1, 2, 3, 4, 5), null, "ACTIVE",
        ),
    )

    private val settings = listOf(
        BranchSetting("approval.limits", "-"),
        BranchSetting("attendance.lockTime", "11:00 AM"),
        BranchSetting("diary.closingTime", "3:00 PM"),
        BranchSetting("diary.moderation", "Off"),
        BranchSetting("messaging.officeHours", "from: 8:00 AM, to: 4:00 PM"),
    )

    fun overview(branchId: String): BranchOverview =
        BranchOverview(branches.firstOrNull { it.id == branchId } ?: branches.first(), settings)

    val sessions = listOf(
        AcademicSession("demo-s-1", MAIN_BRANCH_ID, "2026-27", "2026-04-01", "2027-03-31", "ACTIVE", 3),
        AcademicSession("demo-s-0", MAIN_BRANCH_ID, "2025-26", "2025-04-01", "2026-03-31", "CLOSED", 3),
    )

    val events = listOf(
        CalendarEvent("demo-e-1", "HOLIDAY", "Independence Day", "2026-08-14", "2026-08-14", null),
        CalendarEvent("demo-e-2", "DEADLINE", "First term marks entry", "2026-10-20", "2026-10-20", "All sections"),
        CalendarEvent("demo-e-3", "VACATION", "Winter vacation", "2026-12-22", "2027-01-02", null),
    )

    val classes = listOf(
        SchoolClass("demo-c-1", "Class 1", 1, 5), SchoolClass("demo-c-2", "Class 2", 2, 5),
        SchoolClass("demo-c-4", "Class 4", 4, 7),
        SchoolClass("demo-c-5", "Class 5", 5, 7),
    )

    val sections = DemoPeopleData.sections

    val subjects = listOf(
        Subject("demo-sub-1", "ENG", "English"), Subject("demo-sub-2", "MATH", "Mathematics"),
        Subject("demo-sub-3", "SCI", "Science"), Subject("demo-sub-4", "URD", "Urdu"),
    )

    val deviceSessions = listOf(
        DeviceSession("demo-d-1", "This phone", "ANDROID", "192.168.1.20", null, "2026-10-05T08:00:00Z", current = true),
        DeviceSession("demo-d-2", "Chrome on Windows", "WEB", "192.168.1.11", null, "2026-10-03T15:20:00Z", current = false),
    )
}
