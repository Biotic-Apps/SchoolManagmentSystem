package com.schoolapp.core.data.attendance

import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.StaffAttendanceSheet
import com.schoolapp.core.model.attendance.StaffMark
import com.schoolapp.core.model.attendance.StaffRosterEntry
import com.schoolapp.core.network.dto.attendance.StaffAttendanceRowDto
import com.schoolapp.core.network.dto.attendance.StaffAttendanceSheetDto
import com.schoolapp.core.network.dto.attendance.StaffMarkInputDto

/** Statuses that carry no check-in / check-out times (as on web). */
private val NO_TIMES = setOf(AttendanceStatus.ABSENT, AttendanceStatus.LEAVE)

/** Rows without a staff id are dropped; the requested branch/date fill in when the API omits them. */
internal fun StaffAttendanceSheetDto.toModel(requestedBranchId: String, requestedDate: String) = StaffAttendanceSheet(
    branchId = branchId ?: requestedBranchId,
    date = date ?: requestedDate,
    entries = entries.mapNotNull { it.toModel() },
)

internal fun StaffAttendanceRowDto.toModel(): StaffRosterEntry? {
    val id = staff?.id ?: staffId ?: return null
    return StaffRosterEntry(
        staffId = id,
        name = staff?.name ?: name.orEmpty(),
        designation = designation.clean(),
        photoUrl = photoUrl,
        status = AttendanceStatus.fromKey(status),
        checkIn = checkIn.clean(),
        checkOut = checkOut.clean(),
        remark = remark.clean(),
    )
}

/** Times are dropped for absent / leave, blank remarks are not sent. */
internal fun StaffMark.toDto(): StaffMarkInputDto {
    val timed = status !in NO_TIMES
    return StaffMarkInputDto(
        staffId = staffId,
        status = status.name,
        checkIn = if (timed) checkIn.clean() else null,
        checkOut = if (timed) checkOut.clean() else null,
        remark = remark.clean(),
    )
}
