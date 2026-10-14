package com.schoolapp.feature.admin.users.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.users.AdminUser
import com.schoolapp.core.model.users.UserAssignment
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.roleLabel
import com.schoolapp.feature.admin.R
import java.time.Instant
import java.time.format.DateTimeParseException

@Composable
@ReadOnlyComposable
internal fun userStatusLabel(status: String): String = when (status) {
    AdminUser.STATUS_ACTIVE -> stringResource(R.string.users_status_active)
    AdminUser.STATUS_DISABLED -> stringResource(R.string.users_status_disabled)
    else -> humanizeKey(status)
}

internal fun userStatusTone(status: String): StatusTone =
    if (status == AdminUser.STATUS_ACTIVE) StatusTone.Success else StatusTone.Neutral

/** Locked after too many failed sign-ins and the lock has not run out yet. */
internal fun AdminUser.isLocked(now: Instant = Instant.now()): Boolean = lockedUntil?.let { parseInstant(it)?.isAfter(now) } == true

/** Still in force: no end date, or the end date is in the future. */
internal fun UserAssignment.isActive(now: Instant = Instant.now()): Boolean =
    validUntil?.let { parseInstant(it)?.isAfter(now) != false } ?: true

private fun parseInstant(raw: String): Instant? = try {
    Instant.parse(raw)
} catch (e: DateTimeParseException) {
    null
}

@Composable
@ReadOnlyComposable
internal fun roleKeyLabel(key: String, customName: String? = null): String = roleLabel(RoleRef.of(key), customName)

/** "Whole system", the school, or "School › Branch" (web assignment-rules.ts scopeLabel). */
@Composable
@ReadOnlyComposable
internal fun scopeLabel(assignment: UserAssignment): String = when (assignment.scopeType) {
    "GLOBAL" -> stringResource(R.string.users_scope_global)
    "SCHOOL" -> assignment.schoolName ?: stringResource(R.string.users_scope_school_fallback)
    "BRANCH" -> listOfNotNull(assignment.schoolName, assignment.branchName).joinToString(" › ")
        .ifEmpty { stringResource(R.string.users_scope_branch_fallback) }
    else -> listOfNotNull(humanizeKey(assignment.scopeType), assignment.branchName).joinToString(" · ")
}
