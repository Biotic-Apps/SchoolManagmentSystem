package com.schoolapp.navigation

import androidx.compose.runtime.Composable
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.navigation.NotificationPreferencesDestination
import com.schoolapp.feature.activities.ActivitiesMenuScreen
import com.schoolapp.feature.activities.ChildActivitiesSection
import com.schoolapp.feature.activities.navigation.activitiesDestinations
import com.schoolapp.feature.attendance.AttendanceMenuScreen
import com.schoolapp.feature.attendance.MyAttendanceLeaveScreen
import com.schoolapp.feature.attendance.navigation.attendanceDestinations
import com.schoolapp.feature.complaints.ComplaintsMenuScreen
import com.schoolapp.feature.complaints.complaintsDestinations
import com.schoolapp.feature.diary.DiaryMenuScreen
import com.schoolapp.feature.diary.diaryDestinations
import com.schoolapp.feature.health.HealthMenuScreen
import com.schoolapp.feature.health.healthDestinations
import com.schoolapp.feature.meetings.MeetingsMenuScreen
import com.schoolapp.feature.meetings.navigation.meetingsDestinations
import com.schoolapp.feature.messages.MessagesMenuScreen
import com.schoolapp.feature.messages.messagesDestinations
import com.schoolapp.feature.notices.NoticesMenuScreen
import com.schoolapp.feature.notices.noticesDestinations
import com.schoolapp.feature.pickup.PickupMenuScreen
import com.schoolapp.feature.pickup.pickupDestinations
import com.schoolapp.feature.admissions.list.AdmissionsRoute
import com.schoolapp.feature.admissions.navigation.ApplicationDetailDestination
import com.schoolapp.feature.admissions.navigation.NewApplicationDestination
import com.schoolapp.feature.admissions.navigation.admissionsDestinations
import com.schoolapp.feature.approvals.ApprovalsRoute
import com.schoolapp.feature.approvals.navigation.ApprovalDetailDestination
import com.schoolapp.feature.approvals.navigation.approvalsDestinations
import com.schoolapp.feature.dashboard.DashboardRoute
import com.schoolapp.feature.home.ShellContent
import com.schoolapp.feature.home.ShellNavigator
import com.schoolapp.feature.notifications.navigation.notificationsDestinations
import com.schoolapp.feature.organisation.branches.BranchesRoute
import com.schoolapp.feature.organisation.classes.ClassesRoute
import com.schoolapp.feature.organisation.navigation.BranchDetailDestination
import com.schoolapp.feature.organisation.navigation.organisationDestinations
import com.schoolapp.feature.organisation.sessions.SessionsCalendarRoute
import com.schoolapp.feature.profile.ProfileRoute
import com.schoolapp.feature.profile.navigation.ChangePasswordDestination
import com.schoolapp.feature.profile.navigation.DeviceSessionsDestination
import com.schoolapp.feature.profile.navigation.profileDestinations
import com.schoolapp.feature.staff.list.StaffListRoute
import com.schoolapp.feature.staff.navigation.AddStaffDestination
import com.schoolapp.feature.staff.navigation.StaffDetailDestination
import com.schoolapp.feature.staff.navigation.staffDestinations
import com.schoolapp.feature.students.child.ChildProfileRoute
import com.schoolapp.feature.students.guardians.GuardiansRoute
import com.schoolapp.feature.students.navigation.AddStudentDestination
import com.schoolapp.feature.students.navigation.ContactChangeDestination
import com.schoolapp.feature.students.navigation.LinkChildDestination
import com.schoolapp.feature.students.navigation.SectionRosterDestination
import com.schoolapp.feature.students.navigation.StudentDetailDestination
import com.schoolapp.feature.students.navigation.studentsDestinations
import com.schoolapp.feature.students.sections.MyClassesRoute
import com.schoolapp.feature.timetable.ParentTimetableScreen
import com.schoolapp.feature.timetable.TimetableRoute
import com.schoolapp.feature.timetable.builder.TimetableAdminRoute
import com.schoolapp.feature.timetable.navigation.timetableDestinations
import com.schoolapp.feature.timetable.substitutions.substitutionsTab
import com.schoolapp.core.navigation.TimetableBuilderDestination
import com.schoolapp.feature.certificates.CertificatesMenuScreen
import com.schoolapp.feature.certificates.certificatesDestinations
import com.schoolapp.feature.exams.ExamsMenuScreen
import com.schoolapp.feature.exams.ParentResultsScreen
import com.schoolapp.feature.exams.examsDestinations
import com.schoolapp.feature.fees.FeesMenuScreen
import com.schoolapp.feature.fees.feesDestinations
import com.schoolapp.feature.payroll.MySalaryScreen
import com.schoolapp.feature.payroll.PayrollMenuScreen
import com.schoolapp.feature.payroll.payrollDestinations
import com.schoolapp.feature.progress.ParentProgressScreen
import com.schoolapp.feature.progress.ProgressMenuScreen
import com.schoolapp.feature.progress.progressDestinations

/** Menu ids with a real screen; everything else shows the phase placeholder. */
internal val AppShellContent = ShellContent(
    menuScreens = mapOf(
        MenuIds.DASHBOARD to { shell ->
            DashboardRoute(onOpenMenu = shell::openMenu, canOpenMenu = shell::canOpenMenu, onOpen = shell::open)
        },
        MenuIds.APPROVALS to { shell -> ApprovalsRoute(onOpen = { shell.open(ApprovalDetailDestination(it)) }) },
        MenuIds.PROFILE to { shell ->
            ProfileRoute(
                onChangePassword = { shell.open(ChangePasswordDestination) },
                onDeviceSessions = { shell.open(DeviceSessionsDestination) },
                onNotificationPreferences = { shell.open(NotificationPreferencesDestination) },
            )
        },
        MenuIds.BRANCHES to { shell -> BranchesRoute(onOpenBranch = { shell.open(BranchDetailDestination(it)) }) },
        MenuIds.SESSIONS to { _ -> SessionsCalendarRoute() },
        MenuIds.CLASSES to { shell -> if (shell.activeRole in SECTION_STAFF) MyClasses(shell) else ClassesRoute(onOpenClass = shell::open) },
        MenuIds.STUDENTS to { shell ->
            if (shell.activeRole == RoleKey.PARENT) {
                ChildProfileRoute(
                    onRequestCorrection = { shell.open(ContactChangeDestination) },
                    onLinkChild = { shell.open(LinkChildDestination) },
                )
            } else {
                MyClasses(shell)
            }
        },
        MenuIds.GUARDIANS to { shell ->
            GuardiansRoute(onOpenApprovals = { shell.openMenu(MenuIds.APPROVALS) }.takeIf { shell.canOpenMenu(MenuIds.APPROVALS) })
        },
        MenuIds.TIMETABLE to { shell ->
            if (shell.activeRole == RoleKey.PARENT) {
                ParentTimetableScreen(activitiesContent = { ChildActivitiesSection(onOpen = shell::open, modifier = it) })
            } else if (shell.activeRole in TIMETABLE_BUILDERS) {
                TimetableAdminRoute(extraTab = substitutionsTab())
            } else {
                TimetableRoute(
                    onOpenMenu = shell::openMenu,
                    canOpenMenu = shell::canOpenMenu,
                    onEditSection = { id, title -> shell.open(TimetableBuilderDestination(id, title)) },
                )
            }
        },
        MenuIds.ADMISSIONS to { shell ->
            AdmissionsRoute(
                onOpenApplication = { shell.open(ApplicationDetailDestination(it)) },
                onNewApplication = { shell.open(NewApplicationDestination) },
            )
        },
        MenuIds.STAFF to { shell -> StaffListRoute(onOpenStaff = { shell.open(StaffDetailDestination(it)) }, onAddStaff = { shell.open(AddStaffDestination) }) },
        MenuIds.ATTENDANCE to { shell -> AttendanceMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.MY_SALARY to { shell -> MySalaryScreen(attendanceContent = { MyAttendanceLeaveScreen(onOpen = shell::open) }) },
        MenuIds.DIARY to { shell ->
            DiaryMenuScreen(
                role = shell.activeRole,
                onOpen = shell::open,
                onOpenApprovals = { shell.openMenu(MenuIds.APPROVALS) }.takeIf { shell.canOpenMenu(MenuIds.APPROVALS) },
            )
        },
        MenuIds.ACTIVITIES to { shell -> ActivitiesMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.NOTICES to { shell -> NoticesMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.MESSAGES to { shell -> MessagesMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.COMPLAINTS to { shell -> ComplaintsMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.MEETINGS to { shell -> MeetingsMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.HEALTH to { shell -> HealthMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.PICKUP to { shell -> PickupMenuScreen(role = shell.activeRole, onOpen = shell::open) },
        MenuIds.EXAMS to { shell -> ExamsMenuScreen(role = shell.activeRole, onOpen = shell::open, onOpenApprovals = shell.approvalsLink()) },
        MenuIds.PROGRESS to { shell ->
            if (shell.activeRole == RoleKey.PARENT) {
                ParentProgressScreen(resultsContent = { ParentResultsScreen(onOpen = shell::open, modifier = it) })
            } else {
                ProgressMenuScreen(role = shell.activeRole, onOpen = shell::open)
            }
        },
        MenuIds.FEES to { shell -> FeesMenuScreen(role = shell.activeRole, onOpen = shell::open, onOpenApprovals = shell.approvalsLink()) },
        MenuIds.PAYROLL to { shell -> PayrollMenuScreen(role = shell.activeRole, onOpen = shell::open, onOpenApprovals = shell.approvalsLink()) },
        MenuIds.CERTIFICATES to { shell -> CertificatesMenuScreen(role = shell.activeRole, onOpen = shell::open) },
    ),
    destinations = { navController ->
        approvalsDestinations(navController)
        profileDestinations(navController)
        notificationsDestinations(navController)
        organisationDestinations(navController, canBuildTimetable = { true })
        timetableDestinations(navController)
        studentsDestinations(navController)
        admissionsDestinations(navController)
        staffDestinations(navController)
        attendanceDestinations(navController)
        diaryDestinations(navController)
        activitiesDestinations(navController)
        noticesDestinations(navController)
        messagesDestinations(navController)
        complaintsDestinations(navController)
        meetingsDestinations(navController)
        healthDestinations(navController)
        pickupDestinations(navController)
        examsDestinations(navController)
        progressDestinations(navController)
        feesDestinations(navController)
        payrollDestinations(navController)
        certificatesDestinations(navController)
    },
)

private val SECTION_STAFF = setOf(RoleKey.TEACHER, RoleKey.HELPER)

/** Roles whose Timetable menu is the builder + bell schedule (the API still checks each section). */
private val TIMETABLE_BUILDERS = setOf(RoleKey.SUPER_ADMIN, RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER)

/** Opens the Approvals menu, or null when the role has none. */
private fun ShellNavigator.approvalsLink(): (() -> Unit)? = { openMenu(MenuIds.APPROVALS) }.takeIf { canOpenMenu(MenuIds.APPROVALS) }

@Composable
private fun MyClasses(shell: ShellNavigator) = MyClassesRoute(
    onOpenSection = { id, title -> shell.open(SectionRosterDestination(id, title)) },
    onOpenStudent = { shell.open(StudentDetailDestination(it)) },
    onAddStudent = { shell.open(AddStudentDestination) },
)
