package com.schoolapp.core.data.attendance

import com.schoolapp.core.data.common.approvalId
import com.schoolapp.core.data.common.arrayAt
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.decodeEach
import com.schoolapp.core.data.common.isPendingReview
import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.attendance.AttendanceDay
import com.schoolapp.core.model.attendance.AttendanceRegister
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.AttendanceSummary
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.MyStaffAttendance
import com.schoolapp.core.model.attendance.RegisterEntry
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.attendance.SectionAttendance
import com.schoolapp.core.model.attendance.StaffAttendanceDay
import com.schoolapp.core.model.attendance.StudentAttendance
import com.schoolapp.core.model.attendance.UnmarkedSection
import com.schoolapp.core.network.dto.attendance.AttendanceTallyDto
import com.schoolapp.core.network.dto.attendance.EntryInputDto
import com.schoolapp.core.network.dto.attendance.RegisterDto
import com.schoolapp.core.network.dto.attendance.RegisterEntryDto
import com.schoolapp.core.network.dto.attendance.SectionAttendanceDto
import com.schoolapp.core.network.dto.attendance.StaffAttendanceEntryDto
import com.schoolapp.core.network.dto.attendance.StudentAttendanceDto
import com.schoolapp.core.network.dto.attendance.UnmarkedSectionDto
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlin.math.roundToInt

internal fun RegisterDto.toModel() = AttendanceRegister(
    id = id,
    sectionId = sectionId,
    date = date,
    status = RegisterStatus.fromKey(status),
    version = version,
    submittedBy = submittedBy?.toRef(),
    onBehalfOf = onBehalfOf?.toRef(),
    lockedAt = lockedAt,
    entries = entries.map { it.toModel() },
)

internal fun RegisterEntryDto.toModel() = RegisterEntry(
    entryId = entryId,
    studentId = studentId,
    name = name.orEmpty(),
    rollNo = rollNo,
    photoUrl = photoUrl,
    status = AttendanceStatus.fromKey(status),
    remark = remark,
    onLeave = onLeave,
)

/** Same roster on another date, nothing marked yet (offline open of a date never fetched). */
internal fun RegisterDto.asUnmarked(sectionId: String, date: String) = RegisterDto(
    sectionId = sectionId,
    date = date,
    status = RegisterStatus.UNMARKED.name,
    entries = entries.map { RegisterEntryDto(studentId = it.studentId, name = it.name, rollNo = it.rollNo, photoUrl = it.photoUrl) },
)

internal fun EntryMark.toDto() = EntryInputDto(studentId, status.name, remark.clean())

internal fun EntryInputDto.toMark(): EntryMark? = AttendanceStatus.fromKey(status)?.let { EntryMark(studentId, it, remark) }

/** Result of a draft save / submit: the register, or a probation hold (which may also carry the register). */
internal fun JsonObject.toRegisterResult(json: Json): Pair<RegisterOutcome, RegisterDto?> {
    if (isPendingReview()) {
        val held = if (containsKey("entries")) json.decodeFromJsonElement(RegisterDto.serializer(), this) else null
        return RegisterOutcome.PendingReview(approvalId()) to held
    }
    val register = json.decodeFromJsonElement(RegisterDto.serializer(), this)
    return RegisterOutcome.Saved(register.toModel()) to register
}

internal fun AttendanceTallyDto.toModel() = AttendanceSummary(
    present = present,
    absent = absent,
    late = late,
    leave = leave,
    halfDay = halfDay,
    unmarked = unmarked,
    percent = (percent ?: 0.0).roundToInt().coerceIn(0, 100),
)

internal fun StudentAttendanceDto.toModel() = StudentAttendance(
    days = entries.map { AttendanceDay(it.date, AttendanceStatus.fromKey(it.status), it.remark) }.sortedByDescending { it.date },
    summary = (summary ?: AttendanceTallyDto()).toModel(),
)

internal fun SectionAttendanceDto.toModel() = SectionAttendance(
    sectionId = sectionId,
    className = className,
    sectionName = sectionName,
    status = RegisterStatus.fromKey(status),
    present = present,
    absent = absent,
    late = late,
    leave = leave,
    total = total,
)

internal fun UnmarkedSectionDto.toModel() = UnmarkedSection(sectionId, className, sectionName)

/** `/staff-attendance/me` may be a plain array of days or `{ entries|records|days, summary }`. */
internal fun JsonElement.toMyStaffAttendance(json: Json): MyStaffAttendance {
    val days = json.decodeEach(arrayAt("entries", "records", "days", "items"), StaffAttendanceEntryDto.serializer())
        .map { StaffAttendanceDay(it.date, AttendanceStatus.fromKey(it.status), it.checkIn, it.checkOut, it.remark) }
        .sortedByDescending { it.date }
    val summary = (this as? JsonObject)?.get("summary")
        ?.let { runCatching { json.decodeFromJsonElement(AttendanceTallyDto.serializer(), it) }.getOrNull() }
    return MyStaffAttendance(days, summary?.toModel())
}
