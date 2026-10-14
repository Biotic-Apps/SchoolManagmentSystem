package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.SessionContext

/** What the active role may do with branches; mirrors the web's `useBranchPermissions` (the API enforces it too). */
@Immutable
data class BranchPermissions(
    val canAdd: Boolean = false,
    /** Name, contacts and timings of any branch in scope (school administrators). */
    val canEdit: Boolean = false,
    /** A principal changes only their own branch's timings and working days. */
    val canEditTimings: Boolean = false,
    val canArchive: Boolean = false,
    val canChangePrincipal: Boolean = false,
    val canEditSettings: Boolean = false,
    val canPickSchool: Boolean = false,
) {
    val canActivate: Boolean get() = canEdit
}

internal fun SessionContext.branchPermissions(): BranchPermissions {
    val principal = activeRole == RoleKey.PRINCIPAL
    val edit = has("branches.edit")
    return BranchPermissions(
        canAdd = has("branches.add"),
        canEdit = edit && !principal,
        canEditTimings = edit && principal,
        canArchive = has("branches.delete"),
        canChangePrincipal = has("users.edit") && activeRole == RoleKey.SUPER_ADMIN,
        canEditSettings = has("settings.edit") || principal,
        canPickSchool = has("schools.view"),
    )
}
