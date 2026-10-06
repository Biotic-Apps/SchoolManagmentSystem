package com.schoolapp.feature.complaints.list

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.complaint.ComplaintBox

private val SupervisorRoles = setOf(RoleKey.SUPER_ADMIN, RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER)

/** "My complaints" for everyone; "Assigned to me" for staff; "All" for supervisors with `complaints.view`. */
fun complaintTabs(session: SessionContext): List<ComplaintBox> = buildList {
    add(ComplaintBox.MINE)
    if (session.activeRole != RoleKey.PARENT) add(ComplaintBox.ASSIGNED)
    if (session.activeRole in SupervisorRoles && session.has("complaints.view")) add(ComplaintBox.ALL)
}
