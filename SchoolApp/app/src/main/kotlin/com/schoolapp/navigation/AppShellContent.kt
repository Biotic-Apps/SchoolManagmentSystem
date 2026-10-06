package com.schoolapp.navigation

import androidx.compose.runtime.Composable
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.admissions.list.AdmissionsRoute
import com.schoolapp.feature.admissions.navigation.ApplicationDetailDestination
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
import com.schoolapp.feature.staff.navigation.StaffDetailDestination
import com.schoolapp.feature.staff.navigation.staffDestinations
import com.schoolapp.feature.students.child.ChildProfileRoute
import com.schoolapp.feature.students.guardians.GuardiansRoute
import com.schoolapp.feature.students.navigation.ContactChangeDestination
import com.schoolapp.feature.students.navigation.LinkChildDestination
import com.schoolapp.feature.students.navigation.SectionRosterDestination
import com.schoolapp.feature.students.navigation.StudentDetailDestination
import com.schoolapp.feature.students.navigation.studentsDestinations
import com.schoolapp.feature.students.sections.MyClassesRoute
import com.schoolapp.feature.syllabus.coverage.CoverageRoute
import com.schoolapp.feature.syllabus.navigation.PlanDetailDestination
import com.schoolapp.feature.syllabus.navigation.syllabusDestinations
import com.schoolapp.feature.syllabus.parent.ParentSyllabusRoute
import com.schoolapp.feature.syllabus.plans.MyPlansRoute
import com.schoolapp.feature.timetable.TimetableRoute

/** Menu ids with a real screen; everything else shows the phase placeholder. */
internal val AppShellContent = ShellContent(
    menuScreens = mapOf(
        MenuIds.DASHBOARD to { shell -> DashboardRoute(onOpenMenu = shell::openMenu, canOpenMenu = shell::canOpenMenu) },
        MenuIds.APPROVALS to { shell -> ApprovalsRoute(onOpen = { shell.open(ApprovalDetailDestination(it)) }) },
        MenuIds.PROFILE to { shell ->
            ProfileRoute(
                onChangePassword = { shell.open(ChangePasswordDestination) },
                onDeviceSessions = { shell.open(DeviceSessionsDestination) },
            )
        },
        MenuIds.BRANCHES to { shell -> BranchesRoute(onOpenBranch = { shell.open(BranchDetailDestination(it)) }) },
        MenuIds.SESSIONS to { _ -> SessionsCalendarRoute() },
        MenuIds.CLASSES to { shell -> if (shell.activeRole in SECTION_STAFF) MyClasses(shell) else ClassesRoute() },
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
        MenuIds.TIMETABLE to { _ -> TimetableRoute() },
        MenuIds.SYLLABUS to { shell ->
            val openPlan = { plan: SyllabusPlan ->
                shell.open(PlanDetailDestination(plan.id, plan.sectionId, plan.subjectId))
            }
            when (shell.activeRole) {
                RoleKey.TEACHER, RoleKey.HELPER -> MyPlansRoute(onOpenPlan = openPlan)
                RoleKey.PARENT -> ParentSyllabusRoute(onOpenPlan = openPlan)
                else -> CoverageRoute(
                    onReviewSubmitted = { shell.openMenu(MenuIds.APPROVALS) }.takeIf { shell.canOpenMenu(MenuIds.APPROVALS) },
                )
            }
        },
        MenuIds.ADMISSIONS to { shell -> AdmissionsRoute(onOpenApplication = { shell.open(ApplicationDetailDestination(it)) }) },
        MenuIds.STAFF to { shell -> StaffListRoute(onOpenStaff = { shell.open(StaffDetailDestination(it)) }) },
    ),
    destinations = { navController ->
        approvalsDestinations(navController)
        profileDestinations(navController)
        notificationsDestinations(navController)
        organisationDestinations(navController)
        studentsDestinations(navController)
        syllabusDestinations(navController)
        admissionsDestinations(navController)
        staffDestinations(navController)
    },
)

private val SECTION_STAFF = setOf(RoleKey.TEACHER, RoleKey.HELPER)

@Composable
private fun MyClasses(shell: ShellNavigator) = MyClassesRoute(
    onOpenSection = { id, title -> shell.open(SectionRosterDestination(id, title)) },
    onOpenStudent = { shell.open(StudentDetailDestination(it)) },
)
