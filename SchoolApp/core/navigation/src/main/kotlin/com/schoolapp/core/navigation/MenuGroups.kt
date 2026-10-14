package com.schoolapp.core.navigation

/**
 * Headings of the navigation drawer, in display order. [HOME] has no heading; [MY_WORK] is the user's
 * own attendance, leave and salary; [ACCOUNT] (profile) is always last before Sign out.
 */
enum class MenuGroup { HOME, TEACHING, PEOPLE, COMMUNICATION, FINANCE, SCHOOL, MY_WORK, ACCOUNT }

object MenuGroups {
    private val ByMenu: Map<String, MenuGroup> = mapOf(
        MenuIds.DASHBOARD to MenuGroup.HOME,
        MenuIds.CLASSES to MenuGroup.TEACHING,
        MenuIds.TIMETABLE to MenuGroup.TEACHING,
        MenuIds.ATTENDANCE to MenuGroup.TEACHING,
        MenuIds.DIARY to MenuGroup.TEACHING,
        MenuIds.HOMEWORK to MenuGroup.TEACHING,
        MenuIds.EXAMS to MenuGroup.TEACHING,
        MenuIds.QUESTION_BANK to MenuGroup.TEACHING,
        MenuIds.PROGRESS to MenuGroup.TEACHING,
        MenuIds.ACTIVITIES to MenuGroup.TEACHING,
        MenuIds.HEALTH to MenuGroup.TEACHING,
        MenuIds.PICKUP to MenuGroup.TEACHING,
        MenuIds.STUDENTS to MenuGroup.PEOPLE,
        MenuIds.ADMISSIONS to MenuGroup.PEOPLE,
        MenuIds.GUARDIANS to MenuGroup.PEOPLE,
        MenuIds.STAFF to MenuGroup.PEOPLE,
        MenuIds.USERS to MenuGroup.PEOPLE,
        MenuIds.MESSAGES to MenuGroup.COMMUNICATION,
        MenuIds.MEETINGS to MenuGroup.COMMUNICATION,
        MenuIds.COMPLAINTS to MenuGroup.COMMUNICATION,
        MenuIds.NOTICES to MenuGroup.COMMUNICATION,
        MenuIds.APPROVALS to MenuGroup.COMMUNICATION,
        MenuIds.CERTIFICATES to MenuGroup.COMMUNICATION,
        MenuIds.FEES to MenuGroup.FINANCE,
        MenuIds.PAYROLL to MenuGroup.FINANCE,
        MenuIds.EXPENSES to MenuGroup.FINANCE,
        MenuIds.INVENTORY to MenuGroup.FINANCE,
        MenuIds.ACCOUNTS to MenuGroup.FINANCE,
        MenuIds.REPORTS to MenuGroup.FINANCE,
        MenuIds.SCHOOLS to MenuGroup.SCHOOL,
        MenuIds.BRANCHES to MenuGroup.SCHOOL,
        MenuIds.ROLES to MenuGroup.SCHOOL,
        MenuIds.SESSIONS to MenuGroup.SCHOOL,
        MenuIds.SETTINGS to MenuGroup.SCHOOL,
        MenuIds.MY_SALARY to MenuGroup.MY_WORK,
        MenuIds.PROFILE to MenuGroup.ACCOUNT,
    )

    fun groupOf(id: String): MenuGroup = ByMenu[id] ?: MenuGroup.TEACHING

    /** Non-empty groups in [MenuGroup] order; items keep their menu order inside a group. */
    fun group(items: List<MenuItem>): List<Pair<MenuGroup, List<MenuItem>>> =
        items.groupBy { groupOf(it.id) }.toSortedMap().map { (group, list) -> group to list }
}
