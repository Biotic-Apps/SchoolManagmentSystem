package com.schoolapp.core.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Assignment
import androidx.compose.material.icons.automirrored.outlined.Chat
import androidx.compose.material.icons.automirrored.outlined.DirectionsWalk
import androidx.compose.material.icons.automirrored.outlined.FactCheck
import androidx.compose.material.icons.automirrored.outlined.Grading
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.material.icons.outlined.AccountBalance
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.AdminPanelSettings
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.material.icons.outlined.AssignmentTurnedIn
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.Calculate
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.Layers
import androidx.compose.material.icons.outlined.ManageAccounts
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material.icons.outlined.ReportProblem
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material.icons.outlined.School
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.material.icons.outlined.WorkspacePremium
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.model.Permission

private fun item(id: String, label: String, permission: String, icon: ImageVector) =
    MenuItem(id = id, label = label, permission = Permission(permission), icon = icon)

/** The catalogue table from docs/navigation.md, in catalogue order. */
internal val CatalogEntries: List<MenuItem> = listOf(
    item(MenuIds.DASHBOARD, "Dashboard", "dashboard.view", Icons.Outlined.Dashboard),
    item(MenuIds.SCHOOLS, "Schools", "schools.view", Icons.Outlined.School),
    item(MenuIds.BRANCHES, "Branches", "branches.view", Icons.Outlined.Apartment),
    item(MenuIds.USERS, "Principals & Admin Users", "users.view", Icons.Outlined.ManageAccounts),
    item(MenuIds.ROLES, "Roles & Permissions", "roles.view", Icons.Outlined.AdminPanelSettings),
    item(MenuIds.SESSIONS, "Sessions & Calendar", "sessions.view", Icons.Outlined.CalendarMonth),
    item(MenuIds.CLASSES, "Classes, Sections & Subjects", "classes.view", Icons.Outlined.Layers),
    item(MenuIds.ADMISSIONS, "Admissions", "admissions.view", Icons.AutoMirrored.Outlined.Assignment),
    item(MenuIds.STUDENTS, "Students", "students.view", Icons.Outlined.School),
    item(MenuIds.GUARDIANS, "Parents & Guardians", "guardians.view", Icons.Outlined.FamilyRestroom),
    item(MenuIds.STAFF, "Teachers & Helpers", "staff.view", Icons.Outlined.Badge),
    item(MenuIds.TIMETABLE, "Timetable", "timetable.view", Icons.Outlined.Schedule),
    item(MenuIds.DIARY, "Daily Diary & Homework", "diary.view", Icons.Outlined.EditNote),
    item(MenuIds.HOMEWORK, "Homework Submissions", "homework.view", Icons.Outlined.AssignmentTurnedIn),
    item(MenuIds.ACTIVITIES, "Activities & Events", "activities.view", Icons.Outlined.EmojiEvents),
    item(MenuIds.NOTICES, "Notices", "notices.view", Icons.Outlined.Campaign),
    item(MenuIds.ATTENDANCE, "Attendance & Leave", "attendance.view", Icons.AutoMirrored.Outlined.FactCheck),
    item(MenuIds.EXAMS, "Exams & Results", "exams.view", Icons.AutoMirrored.Outlined.Grading),
    item(MenuIds.QUESTION_BANK, "Question Bank & Papers", "questions.view", Icons.AutoMirrored.Outlined.MenuBook),
    item(MenuIds.PROGRESS, "Student Progress", "progress.view", Icons.AutoMirrored.Outlined.TrendingUp),
    item(MenuIds.FEES, "Fees & Dues", "fees.view", Icons.Outlined.AccountBalanceWallet),
    item(MenuIds.PAYROLL, "Salary & Payroll", "payroll.view", Icons.Outlined.Payments),
    item(MenuIds.EXPENSES, "Expenses & Vendors", "expenses.view", Icons.AutoMirrored.Outlined.ReceiptLong),
    item(MenuIds.INVENTORY, "Inventory & Purchasing", "inventory.view", Icons.Outlined.Inventory2),
    item(MenuIds.ACCOUNTS, "Accounts", "expenses.view", Icons.Outlined.Calculate),
    item(MenuIds.HEALTH, "Health & Safety", "health.view", Icons.Outlined.HealthAndSafety),
    item(MenuIds.PICKUP, "Pickup & Departure", "pickup.view", Icons.AutoMirrored.Outlined.DirectionsWalk),
    item(MenuIds.MESSAGES, "Messages", "messages.view", Icons.AutoMirrored.Outlined.Chat),
    item(MenuIds.MEETINGS, "Meetings & Appointments", "meetings.view", Icons.Outlined.EventAvailable),
    item(MenuIds.COMPLAINTS, "Complaints", "complaints.view", Icons.Outlined.ReportProblem),
    item(MenuIds.CERTIFICATES, "Certificates", "certificates.view", Icons.Outlined.WorkspacePremium),
    item(MenuIds.APPROVALS, "Approvals", "approvals.view", Icons.Outlined.TaskAlt),
    item(MenuIds.REPORTS, "Reports & History", "reports.view", Icons.Outlined.BarChart),
    item(MenuIds.MY_SALARY, "My Attendance, Leave & Salary", "self.payroll.view", Icons.Outlined.AccountBalance),
    item(MenuIds.SETTINGS, "Settings & Backups", "settings.view", Icons.Outlined.Settings),
    item(MenuIds.PROFILE, "Profile & Security", "profile.view", Icons.Outlined.AccountCircle),
)
