package com.schoolapp.core.data.complaints

import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.data.common.toAttachments
import com.schoolapp.core.data.common.toRef
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintInput
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.core.model.complaint.ComplaintUpdate
import com.schoolapp.core.network.dto.complaint.ComplaintBodyDto
import com.schoolapp.core.network.dto.complaint.ComplaintDto
import com.schoolapp.core.network.dto.complaint.ComplaintUpdateDto

/** Anonymous complaints never expose the complainant on this device. */
internal fun ComplaintDto.toModel() = Complaint(
    id = id,
    ticketNo = ticketNo.orEmpty(),
    category = enumOrDefault(category, ComplaintCategory.OTHER),
    subject = subject.orEmpty(),
    description = description.orEmpty(),
    status = enumOrDefault(status, ComplaintStatus.SUBMITTED),
    escalationLevel = escalationLevel,
    slaDueAt = slaDueAt,
    overdue = overdue,
    complainant = if (anonymous) null else complainant?.toRef(),
    complainantRole = if (anonymous) null else complainant?.role,
    against = against?.toRef(),
    student = student?.toRef(),
    assignee = assignee?.toRef(),
    updates = updates.mapIndexed { index, it -> it.toModel(index) }.sortedBy { it.at.orEmpty() },
    createdAt = createdAt,
)

internal fun ComplaintUpdateDto.toModel(index: Int) = ComplaintUpdate(
    id = id ?: "update-$index",
    authorName = author?.name,
    message = message.orEmpty(),
    status = enumOrNull<ComplaintStatus>(status),
    at = at ?: createdAt,
    attachments = attachments.toAttachments(),
)

internal fun ComplaintInput.toBody() = ComplaintBodyDto(
    category = category.name,
    subject = subject.trim(),
    description = description.trim(),
    studentId = studentId,
    anonymous = anonymous.takeIf { it },
    attachmentFileIds = attachmentFileIds.orNullIfEmpty(),
)
