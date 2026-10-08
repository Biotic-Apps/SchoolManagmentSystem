package com.schoolapp.feature.students.sections

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.SessionContext

private val SECTION_ONLY_ROLES = setOf<RoleRef>(RoleKey.TEACHER, RoleKey.HELPER, RoleKey.PARENT)

/**
 * Mirrors the web Students page: roles that browse the branch (principal, supervisors, accountant,
 * super admin, custom roles reaching Students) can search; teachers and helpers only browse their
 * own sections. The server still scopes every result.
 */
internal fun SessionContext.canSearchStudents(): Boolean = activeRole !in SECTION_ONLY_ROLES
