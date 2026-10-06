package com.schoolapp.feature.attendance.register

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext

/** What the active role may do on a register; supervisors only mark with `teacherwork.proxy`. */
internal data class RegisterPermissions(
    val isHelper: Boolean,
    val canEdit: Boolean,
    val canSubmit: Boolean,
    val canRequestCorrection: Boolean,
) {
    companion object {
        const val EDIT = "attendance.edit"
        const val SUBMIT = "attendance.submit"
        const val PROXY = "teacherwork.proxy"

        val SUPERVISORS = setOf(RoleKey.PRINCIPAL, RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER, RoleKey.SUPER_ADMIN)

        fun of(session: SessionContext): RegisterPermissions {
            val role = session.activeRole
            val isHelper = role == RoleKey.HELPER
            val proxyAllowed = role !in SUPERVISORS || session.has(PROXY)
            return RegisterPermissions(
                isHelper = isHelper,
                canEdit = session.has(EDIT) && proxyAllowed,
                canSubmit = !isHelper && session.has(SUBMIT) && proxyAllowed,
                canRequestCorrection = !isHelper && session.has(EDIT),
            )
        }
    }
}
