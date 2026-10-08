package com.schoolapp.core.navigation

/** Headings of the "More" sheet, in display order; [ACCOUNT] (profile, settings, sign out) is always last. */
enum class MenuGroup { DAILY, PEOPLE, COMMUNICATION, FINANCE, SCHOOL, ACCOUNT }

object MenuGroups {
    private val ByMenu: Map<String, MenuGroup> = mapOf(
        MenuIds.DASHBOARD to MenuGroup.DAILY,
        MenuIds.TIMETABLE to MenuGroup.DAILY,
        MenuIds.ATTENDANCE to MenuGroup.DAILY,
        MenuIds.DIARY to MenuGroup.DAILY,
        MenuIds.SYLLABUS to MenuGroup.DAILY,
        MenuIds.ACTIVITIES to MenuGroup.DAILY,
        MenuIds.EXAMS to MenuGroup.DAILY,
        MenuIds.PROGRESS to MenuGroup.DAILY,
        MenuIds.HEALTH to MenuGroup.DAILY,
        MenuIds.PICKUP to MenuGroup.DAILY,
        MenuIds.CLASSES to MenuGroup.PEOPLE,
        MenuIds.STUDENTS to MenuGroup.PEOPLE,
        MenuIds.ADMISSIONS to MenuGroup.PEOPLE,
        MenuIds.GUARDIANS to MenuGroup.PEOPLE,
        MenuIds.STAFF to MenuGroup.PEOPLE,
        MenuIds.USERS to MenuGroup.PEOPLE,
        MenuIds.NOTICES to MenuGroup.COMMUNICATION,
        MenuIds.MESSAGES to MenuGroup.COMMUNICATION,
        MenuIds.MEETINGS to MenuGroup.COMMUNICATION,
        MenuIds.COMPLAINTS to MenuGroup.COMMUNICATION,
        MenuIds.APPROVALS to MenuGroup.COMMUNICATION,
        MenuIds.CERTIFICATES to MenuGroup.COMMUNICATION,
        MenuIds.FEES to MenuGroup.FINANCE,
        MenuIds.PAYROLL to MenuGroup.FINANCE,
        MenuIds.EXPENSES to MenuGroup.FINANCE,
        MenuIds.INVENTORY to MenuGroup.FINANCE,
        MenuIds.REPORTS to MenuGroup.FINANCE,
        MenuIds.MY_SALARY to MenuGroup.FINANCE,
        MenuIds.SCHOOLS to MenuGroup.SCHOOL,
        MenuIds.BRANCHES to MenuGroup.SCHOOL,
        MenuIds.ROLES to MenuGroup.SCHOOL,
        MenuIds.SESSIONS to MenuGroup.SCHOOL,
        MenuIds.PROFILE to MenuGroup.ACCOUNT,
        MenuIds.SETTINGS to MenuGroup.ACCOUNT,
    )

    fun groupOf(id: String): MenuGroup = ByMenu[id] ?: MenuGroup.DAILY

    /** Non-empty groups in [MenuGroup] order; items keep their menu order inside a group. */
    fun group(items: List<MenuItem>): List<Pair<MenuGroup, List<MenuItem>>> =
        items.groupBy { groupOf(it.id) }.toSortedMap().map { (group, list) -> group to list }
}
