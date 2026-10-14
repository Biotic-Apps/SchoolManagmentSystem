package com.schoolapp.core.data.organisation

import com.schoolapp.core.model.organisation.BranchSettingsValues
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject

/** Settings may arrive flat (`attendance.lockTime`) or nested (`{ attendance: { lockTime } }`); same defaults as the web. */
internal fun JsonObject.toSettingsValues(): BranchSettingsValues {
    val defaults = BranchSettingsValues()
    val office = read("messaging.officeHours") as? JsonObject
    val bank = read("fees.bankAccount") as? JsonObject
    return BranchSettingsValues(
        attendanceLockTime = read("attendance.lockTime").text() ?: defaults.attendanceLockTime,
        diaryModeration = (read("diary.moderation") as? JsonPrimitive)?.booleanOrNull == true,
        diaryClosingTime = read("diary.closingTime").text() ?: defaults.diaryClosingTime,
        officeFrom = office?.get("from").text() ?: defaults.officeFrom,
        officeTo = office?.get("to").text() ?: defaults.officeTo,
        bankName = bank?.get("bankName").text().orEmpty(),
        bankAccountTitle = bank?.get("accountTitle").text().orEmpty(),
        bankAccountNumber = bank?.get("accountNumber").text().orEmpty(),
        bankBranchCode = bank?.get("branchCode").text().orEmpty(),
        challanNote = read("fees.challanNote").text().orEmpty(),
    )
}

/** PATCH body with the web's flat keys. */
internal fun BranchSettingsValues.toPatch(): JsonObject = buildJsonObject {
    put("attendance.lockTime", attendanceLockTime)
    put("diary.moderation", diaryModeration)
    put("diary.closingTime", diaryClosingTime)
    putJsonObject("messaging.officeHours") {
        put("from", officeFrom)
        put("to", officeTo)
    }
    putJsonObject("fees.bankAccount") {
        put("bankName", bankName.trim())
        put("accountTitle", bankAccountTitle.trim())
        put("accountNumber", bankAccountNumber.trim())
        put("branchCode", bankBranchCode.trim())
    }
    put("fees.challanNote", challanNote.trim())
}

private fun JsonObject.read(key: String): JsonElement? =
    get(key) ?: key.split('.').fold(this as JsonElement?) { node, part -> (node as? JsonObject)?.get(part) }

private fun JsonElement?.text(): String? = (this as? JsonPrimitive)?.takeIf { it.isString }?.contentOrNull
