package com.schoolapp.core.data.notices

import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.data.common.toAttachments
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeAudience
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.network.dto.notice.NoticeAudienceDto
import com.schoolapp.core.network.dto.notice.NoticeBodyDto
import com.schoolapp.core.network.dto.notice.NoticeDto

internal fun NoticeDto.toModel() = Notice(
    id = id,
    title = title,
    body = body.orEmpty(),
    status = enumOrDefault(status, NoticeStatus.PUBLISHED),
    pinned = pinned,
    publishedAt = publishedAt ?: createdAt,
    expiresOn = expiresOn,
    authorName = (author ?: createdBy)?.name,
    audienceLabel = audienceLabel,
    isRead = isRead ?: read ?: (readAt != null),
    attachments = attachments.toAttachments(),
    audience = audience?.toModel() ?: NoticeAudience(),
    authorId = (author ?: createdBy)?.let { it.id ?: it.userId },
    branchId = branchId,
    createdAt = createdAt,
)

/** Pinned first, then newest. */
internal fun List<Notice>.ordered(): List<Notice> =
    sortedWith(compareByDescending<Notice> { it.pinned }.thenByDescending { it.publishedAt.orEmpty() })

private fun NoticeAudienceDto.toModel() = NoticeAudience(
    schoolWide = schoolWide == true,
    branchIds = branchIds.orEmpty(),
    classIds = classIds.orEmpty(),
    sectionIds = sectionIds.orEmpty(),
    staffOnly = staffOnly == true,
    guardianIds = guardianIds.orEmpty(),
)

/** School-wide sends only the flags; otherwise the chosen branches / classes / sections (as the web form does). */
internal fun NoticeInput.toBody() = NoticeBodyDto(
    title = title.trim(),
    body = body.trim(),
    audience = if (audience.schoolWide) {
        NoticeAudienceDto(schoolWide = true, staffOnly = audience.staffOnly)
    } else {
        NoticeAudienceDto(
            branchIds = audience.branchIds.orNullIfEmpty(),
            classIds = audience.classIds.orNullIfEmpty(),
            sectionIds = audience.sectionIds.orNullIfEmpty(),
            staffOnly = audience.staffOnly,
            guardianIds = audience.guardianIds.orNullIfEmpty(),
        )
    },
    attachmentFileIds = attachmentFileIds,
    expiresOn = expiresOn,
    pinned = pinned,
)
