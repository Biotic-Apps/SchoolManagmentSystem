package com.schoolapp.feature.notices

import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus

/** Mirrors the API guards on notices. */
internal object NoticePermissions {
    const val ADD = "notices.add"
    const val PUBLISH = "notices.publish"

    fun canAdd(session: SessionContext): Boolean = session.has(ADD)

    fun canPublish(session: SessionContext): Boolean = session.has(PUBLISH) || session.has(ADD)

    /** Only the author edits, and only while the notice is a draft. */
    fun canEdit(session: SessionContext, notice: Notice): Boolean =
        notice.status == NoticeStatus.DRAFT && session.has(ADD) && (notice.authorId == null || notice.authorId == session.user.id)
}
