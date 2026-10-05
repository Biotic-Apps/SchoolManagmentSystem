package com.schoolapp.core.testing

import com.schoolapp.core.model.Permission
import com.schoolapp.core.model.RoleAssignment
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.ScopeType
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.User

object TestSessions {
    fun session(
        role: RoleRef,
        vararg permissions: String,
        user: User = User(id = "u1", fullName = "Sara Ali", email = "sara@school.pk", phone = "03001234567"),
        branchId: String? = "b1",
    ) = SessionContext(
        user = user,
        assignments = listOf(
            RoleAssignment("a1", role, ScopeType.BRANCH, branchId = branchId, branchName = "Main Branch", schoolId = "s1"),
        ),
        activeRole = role,
        permissions = permissions.map(::Permission).toSet(),
    )
}
