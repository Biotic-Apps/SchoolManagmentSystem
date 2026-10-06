package com.schoolapp.core.data.notices

import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.notice.Notice
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
)

/** Pinned first, then newest. */
internal fun List<Notice>.ordered(): List<Notice> =
    sortedWith(compareByDescending<Notice> { it.pinned }.thenByDescending { it.publishedAt.orEmpty() })

internal fun NoticeInput.toBody() = NoticeBodyDto(
    title = title.trim(),
    body = body.trim(),
    audience = if (wholeBranch) {
        NoticeAudienceDto(branchIds = listOfNotNull(branchId).orNullIfEmpty())
    } else {
        NoticeAudienceDto(classIds = classIds.orNullIfEmpty(), sectionIds = sectionIds.orNullIfEmpty())
    },
    expiresOn = expiresOn,
    pinned = pinned.takeIf { it },
)
