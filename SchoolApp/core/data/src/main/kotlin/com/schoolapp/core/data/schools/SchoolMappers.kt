package com.schoolapp.core.data.schools

import com.schoolapp.core.model.schools.LogoChange
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.model.schools.SchoolDeletionPreview
import com.schoolapp.core.model.schools.SchoolDeletionState
import com.schoolapp.core.model.schools.SchoolDeletionStatus
import com.schoolapp.core.model.schools.SchoolSetupResult
import com.schoolapp.core.model.schools.SchoolUpdate
import com.schoolapp.core.network.schools.SchoolDeletionPreviewDto
import com.schoolapp.core.network.schools.SchoolDeletionStatusDto
import com.schoolapp.core.network.schools.SchoolDto
import com.schoolapp.core.network.schools.SchoolSetupResultDto
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject

internal fun SchoolDto.toModel() = School(
    id = id,
    code = code,
    name = name,
    address = address,
    phone = phone,
    email = email,
    website = website,
    logoUrl = logoUrl,
    status = status,
    branchCount = branchCount,
    createdAt = createdAt,
)

/** Blank contact fields are sent as JSON null (cleared); the logo key is only sent when it changes. */
internal fun SchoolUpdate.toBody(): JsonObject = buildJsonObject {
    put("name", JsonPrimitive(name.trim()))
    put("address", address.orJsonNull())
    put("phone", phone.orJsonNull())
    put("email", email.orJsonNull())
    put("website", website.orJsonNull())
    when (val change = logo) {
        LogoChange.Keep -> Unit
        LogoChange.Remove -> put("logoFileId", JsonNull)
        is LogoChange.Replace -> put("logoFileId", JsonPrimitive(change.fileId))
    }
}

private fun String?.orJsonNull() = this?.trim()?.takeIf { it.isNotEmpty() }?.let(::JsonPrimitive) ?: JsonNull

internal fun SchoolDeletionPreviewDto.toModel() = SchoolDeletionPreview(
    code = code,
    name = name,
    status = status,
    lastActiveSchool = lastActiveSchool,
    summary = summary.filter { it.count > 0 }.map { it.key to it.count },
    removedUsers = removedUsers,
    keptUsers = keptUsers,
)

internal fun SchoolDeletionStatusDto.toModel() = SchoolDeletionStatus(SchoolDeletionState.parse(state), error)

internal fun SchoolSetupResultDto.toModel() = SchoolSetupResult(
    schoolId = school.id,
    schoolName = school.name,
    branchId = branch.id,
    branchName = branch.name,
    principalName = principal.name,
    principalEmail = principal.email,
    principalPhone = principal.phone,
    temporaryPassword = principal.temporaryPassword?.takeIf { it.isNotBlank() },
    sessionName = session?.name,
    classes = counts.classes,
    sections = counts.sections,
    subjects = counts.subjects,
)
