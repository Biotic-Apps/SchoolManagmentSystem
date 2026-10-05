package com.schoolapp.navigation

import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.approvals.ApprovalsRoute
import com.schoolapp.feature.approvals.navigation.ApprovalDetailDestination
import com.schoolapp.feature.approvals.navigation.approvalsDestinations
import com.schoolapp.feature.dashboard.DashboardRoute
import com.schoolapp.feature.home.ShellContent
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

/** Menu ids with a real screen in Phase 1; everything else shows the phase placeholder. */
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
        MenuIds.CLASSES to { _ -> ClassesRoute() },
    ),
    destinations = { navController ->
        approvalsDestinations(navController)
        profileDestinations(navController)
        notificationsDestinations(navController)
        organisationDestinations(navController)
    },
)
