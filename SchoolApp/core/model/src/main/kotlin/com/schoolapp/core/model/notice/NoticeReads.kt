package com.schoolapp.core.model.notice

/** Read receipts of a published notice. */
data class NoticeReads(val total: Int, val read: Int, val unread: Int) {
    val percent: Int get() = if (total > 0) (read * 100) / total else 0
}
