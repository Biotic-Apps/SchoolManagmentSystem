package com.schoolapp.core.navigation

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.navigation.MenuIds.ACCOUNTS
import com.schoolapp.core.navigation.MenuIds.ACTIVITIES
import com.schoolapp.core.navigation.MenuIds.ADMISSIONS
import com.schoolapp.core.navigation.MenuIds.APPROVALS
import com.schoolapp.core.navigation.MenuIds.ATTENDANCE
import com.schoolapp.core.navigation.MenuIds.BRANCHES
import com.schoolapp.core.navigation.MenuIds.CERTIFICATES
import com.schoolapp.core.navigation.MenuIds.CLASSES
import com.schoolapp.core.navigation.MenuIds.COMPLAINTS
import com.schoolapp.core.navigation.MenuIds.DASHBOARD
import com.schoolapp.core.navigation.MenuIds.DIARY
import com.schoolapp.core.navigation.MenuIds.EXAMS
import com.schoolapp.core.navigation.MenuIds.EXPENSES
import com.schoolapp.core.navigation.MenuIds.FEES
import com.schoolapp.core.navigation.MenuIds.GUARDIANS
import com.schoolapp.core.navigation.MenuIds.HEALTH
import com.schoolapp.core.navigation.MenuIds.HOMEWORK
import com.schoolapp.core.navigation.MenuIds.INVENTORY
import com.schoolapp.core.navigation.MenuIds.MEETINGS
import com.schoolapp.core.navigation.MenuIds.MESSAGES
import com.schoolapp.core.navigation.MenuIds.MY_SALARY
import com.schoolapp.core.navigation.MenuIds.NOTICES
import com.schoolapp.core.navigation.MenuIds.PAYROLL
import com.schoolapp.core.navigation.MenuIds.PICKUP
import com.schoolapp.core.navigation.MenuIds.PROFILE
import com.schoolapp.core.navigation.MenuIds.PROGRESS
import com.schoolapp.core.navigation.MenuIds.QUESTION_BANK
import com.schoolapp.core.navigation.MenuIds.REPORTS
import com.schoolapp.core.navigation.MenuIds.ROLES
import com.schoolapp.core.navigation.MenuIds.SCHOOLS
import com.schoolapp.core.navigation.MenuIds.SESSIONS
import com.schoolapp.core.navigation.MenuIds.SETTINGS
import com.schoolapp.core.navigation.MenuIds.STAFF
import com.schoolapp.core.navigation.MenuIds.STUDENTS
import com.schoolapp.core.navigation.MenuIds.TIMETABLE
import com.schoolapp.core.navigation.MenuIds.USERS

private val SupervisorOrder = listOf(
    DASHBOARD, CLASSES, STUDENTS, STAFF, TIMETABLE, ATTENDANCE, DIARY, HOMEWORK, ACTIVITIES,
    EXAMS, PROGRESS, HEALTH, PICKUP, MESSAGES, MEETINGS, COMPLAINTS, APPROVALS, MY_SALARY, PROFILE,
)

/** Default menu order per role (docs/navigation.md "Default menus by role"). */
internal val RoleMenuOrder: Map<RoleKey, List<String>> = mapOf(
    RoleKey.SUPER_ADMIN to listOf(
        DASHBOARD, SCHOOLS, BRANCHES, USERS, ROLES, SESSIONS, CLASSES, STUDENTS, ADMISSIONS, GUARDIANS,
        STAFF, TIMETABLE, DIARY, HOMEWORK, ACTIVITIES, NOTICES, ATTENDANCE, EXAMS, QUESTION_BANK, FEES, PAYROLL,
        EXPENSES, INVENTORY, ACCOUNTS, HEALTH, PICKUP, COMPLAINTS, CERTIFICATES, APPROVALS, REPORTS, SETTINGS, PROFILE,
    ),
    RoleKey.PRINCIPAL to listOf(
        DASHBOARD, BRANCHES, CLASSES, STUDENTS, ADMISSIONS, GUARDIANS, STAFF, TIMETABLE, ATTENDANCE, DIARY,
        HOMEWORK, ACTIVITIES, NOTICES, EXAMS, QUESTION_BANK, FEES, PAYROLL, EXPENSES, INVENTORY, ACCOUNTS, HEALTH, PICKUP,
        MESSAGES, MEETINGS, COMPLAINTS, CERTIFICATES, APPROVALS, REPORTS, SETTINGS, PROFILE,
    ),
    // Owner decision 2026-10-09: coordinators manage branch payroll too.
    RoleKey.COORDINATOR to SupervisorOrder.dropLast(2) + listOf(QUESTION_BANK, PAYROLL, MY_SALARY, PROFILE),
    RoleKey.HEAD_TEACHER to SupervisorOrder,
    RoleKey.TEACHER to listOf(
        DASHBOARD, CLASSES, TIMETABLE, ATTENDANCE, DIARY, HOMEWORK, ACTIVITIES, EXAMS, QUESTION_BANK, PROGRESS,
        MESSAGES, MEETINGS, COMPLAINTS, MY_SALARY, PROFILE,
    ),
    RoleKey.HELPER to listOf(DASHBOARD, CLASSES, ATTENDANCE, DIARY, ACTIVITIES, COMPLAINTS, MY_SALARY, PROFILE),
    RoleKey.ACCOUNTANT to listOf(
        DASHBOARD, STUDENTS, FEES, PAYROLL, EXPENSES, INVENTORY, ACCOUNTS, COMPLAINTS, REPORTS, MY_SALARY, PROFILE,
    ),
    RoleKey.PARENT to listOf(
        DASHBOARD, STUDENTS, DIARY, HOMEWORK, ATTENDANCE, PROGRESS, TIMETABLE, FEES, CERTIFICATES, MESSAGES,
        MEETINGS, COMPLAINTS, PROFILE,
    ),
)
