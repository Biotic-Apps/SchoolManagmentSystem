package com.schoolapp.core.data.organisation

import com.schoolapp.core.model.organisation.BranchDetailsInput
import com.schoolapp.core.model.organisation.BranchScheduleInput
import com.schoolapp.core.model.organisation.BranchTimings
import com.schoolapp.core.model.organisation.CalendarEventInput
import com.schoolapp.core.network.dto.organisation.BranchTimingsDto
import com.schoolapp.core.network.dto.organisation.CreateBranchRequest
import com.schoolapp.core.network.dto.organisation.CreateCalendarEventRequest
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject

internal fun String?.blankToNull(): String? = this?.trim()?.takeIf { it.isNotEmpty() }

private fun String?.orJsonNull(): JsonElement = blankToNull()?.let(::JsonPrimitive) ?: JsonNull

internal fun BranchTimings.toDto() = BranchTimingsDto(opensAt, closesAt, attendanceLockAt, staffArrivesAt, staffLeavesAt)

internal fun createBranchRequest(details: BranchDetailsInput, schedule: BranchScheduleInput) = CreateBranchRequest(
    schoolId = details.schoolId.orEmpty(),
    code = details.code.orEmpty().trim().uppercase(),
    name = details.name.trim(),
    address = details.address.blankToNull(),
    phone = details.phone.blankToNull(),
    email = details.email.blankToNull(),
    timings = schedule.timings.toDto(),
    workingDays = schedule.workingDays.sorted(),
)

/** PATCH /branches/:id: contacts are sent with explicit nulls so clearing a field sticks. */
internal fun branchPatch(details: BranchDetailsInput?, schedule: BranchScheduleInput): JsonObject = buildJsonObject {
    if (details != null) {
        put("name", details.name.trim())
        put("address", details.address.orJsonNull())
        put("phone", details.phone.orJsonNull())
        put("email", details.email.orJsonNull())
    }
    val t = schedule.timings
    putJsonObject("timings") {
        put("opensAt", t.opensAt)
        put("closesAt", t.closesAt)
        put("attendanceLockAt", t.attendanceLockAt)
        t.staffArrivesAt?.let { put("staffArrivesAt", it) }
        t.staffLeavesAt?.let { put("staffLeavesAt", it) }
    }
    putJsonArray("workingDays") { schedule.workingDays.sorted().forEach { add(JsonPrimitive(it)) } }
}

internal fun CalendarEventInput.toCreateRequest() = CreateCalendarEventRequest(
    schoolId = schoolId,
    branchId = branchId,
    type = type,
    title = title.trim(),
    startDate = startDate,
    endDate = endDate,
    description = description.blankToNull(),
)

/** PATCH /calendar/:id: only the fields the API accepts; a blank description clears it. */
internal fun CalendarEventInput.toPatch(): JsonObject = buildJsonObject {
    put("type", type)
    put("title", title.trim())
    put("startDate", startDate)
    put("endDate", endDate)
    put("description", description.orJsonNull())
}
