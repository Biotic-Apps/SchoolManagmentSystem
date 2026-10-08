package com.schoolapp.feature.staff.common

import com.schoolapp.core.model.SessionContext

/** Same permission keys the web panel checks (`can("staff.add")`, `can("staff.edit")`). */
object StaffPermissions {
    const val ADD = "staff.add"
    const val EDIT = "staff.edit"
    const val TIMETABLE_EDIT = "timetable.edit"

    fun canAdd(session: SessionContext?): Boolean = session?.has(ADD) == true

    fun canEdit(session: SessionContext?): Boolean = session?.has(EDIT) == true

    /** Allocation endpoints accept either key (API `RequirePermission('timetable.edit', 'staff.edit')`). */
    fun canAllocate(session: SessionContext?): Boolean = session?.has(EDIT) == true || session?.has(TIMETABLE_EDIT) == true
}
