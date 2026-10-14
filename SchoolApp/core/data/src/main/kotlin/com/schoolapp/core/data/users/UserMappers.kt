package com.schoolapp.core.data.users

import com.schoolapp.core.model.users.AdminUser
import com.schoolapp.core.model.users.AdminUserDetail
import com.schoolapp.core.model.users.AssignmentRequest
import com.schoolapp.core.model.users.NewUser
import com.schoolapp.core.model.users.UserAssignment
import com.schoolapp.core.model.users.UserContactUpdate
import com.schoolapp.core.network.users.AssignmentBody
import com.schoolapp.core.network.users.CreateUserBody
import com.schoolapp.core.network.users.UserAssignmentDto
import com.schoolapp.core.network.users.UserDetailDto
import com.schoolapp.core.network.users.UserSummaryDto
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject

internal fun UserSummaryDto.toModel() =
    AdminUser(id, name, email, phone, status, roles, branchNames, lastLoginAt, lockedUntil)

internal fun UserDetailDto.toDetail() = AdminUserDetail(
    user = AdminUser(id, name, email, phone, status, roles, branchNames, lastLoginAt, lockedUntil),
    assignments = assignments.map { it.toModel() },
    mustChangePassword = mustChangePassword,
    createdAt = createdAt,
)

private fun UserAssignmentDto.toModel() =
    UserAssignment(id, role, roleName, scopeType, schoolId, schoolName, branchId, branchName, validUntil)

internal fun AssignmentRequest.toBody() = AssignmentBody(
    roleKey = roleKey,
    scopeType = scopeType,
    schoolId = schoolId.takeIf { scopeType == SCOPE_SCHOOL },
    branchId = branchId.takeIf { scopeType == SCOPE_BRANCH },
    validUntil = validUntil?.takeIf { it.isNotBlank() },
)

internal fun NewUser.toBody() = CreateUserBody(
    name = name.trim(),
    email = email.blank(),
    phone = phone.blank(),
    password = password?.takeIf { it.isNotEmpty() },
    assignments = assignments.map { it.toBody() },
)

/** Blank email / phone are sent as JSON null so the server clears them. */
internal fun UserContactUpdate.toBody(): JsonObject = buildJsonObject {
    put("name", JsonPrimitive(name.trim()))
    put("email", email.blank()?.let(::JsonPrimitive) ?: JsonNull)
    put("phone", phone.blank()?.let(::JsonPrimitive) ?: JsonNull)
}

private fun String?.blank(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

private const val SCOPE_SCHOOL = "SCHOOL"
private const val SCOPE_BRANCH = "BRANCH"
