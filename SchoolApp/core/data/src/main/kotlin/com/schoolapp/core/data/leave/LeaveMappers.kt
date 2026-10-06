package com.schoolapp.core.data.leave

import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.leave.LeaveInput
import com.schoolapp.core.model.leave.LeaveKind
import com.schoolapp.core.model.leave.LeaveRequest
import com.schoolapp.core.model.leave.LeaveStatus
import com.schoolapp.core.model.leave.LeaveType
import com.schoolapp.core.network.dto.leave.LeaveBodyDto
import com.schoolapp.core.network.dto.leave.LeaveDto

internal fun LeaveDto.toModel(): LeaveRequest {
    val leaveType = enumOrNull<LeaveType>(type)
    return LeaveRequest(
        id = id,
        kind = enumOrNull<LeaveKind>(kind) ?: if (leaveType != null) LeaveKind.STAFF else LeaveKind.STUDENT,
        subject = subject?.toRef() ?: PersonRef(null, ""),
        from = from,
        to = to,
        days = days,
        type = leaveType,
        reason = reason.orEmpty(),
        status = enumOrDefault(status, LeaveStatus.SUBMITTED),
        requestedBy = requestedBy?.toRef(),
        decidedBy = decidedBy?.toRef(),
        comment = comment,
        createdAt = createdAt,
    )
}

internal fun LeaveInput.toBody(): LeaveBodyDto = when (this) {
    is LeaveInput.ForStudent -> LeaveBodyDto(studentId = studentId, from = from, to = to, reason = reason.trim())
    is LeaveInput.ForSelf -> LeaveBodyDto(type = type.name, from = from, to = to, reason = reason.trim())
}
