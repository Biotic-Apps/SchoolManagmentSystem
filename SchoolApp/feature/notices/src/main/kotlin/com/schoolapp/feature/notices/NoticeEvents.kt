package com.schoolapp.feature.notices

import com.schoolapp.core.model.notice.Notice
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

enum class NoticeComposeResult { PUBLISHED, SENT_FOR_APPROVAL, DRAFT_SAVED }

/** Feature-wide hand-offs: the notice opened from a list (so detail / edit need no refetch) and save / publish outcomes. */
@Singleton
class NoticeEvents @Inject constructor() {
    private val opened = mutableMapOf<String, Notice>()
    private val _changes = MutableSharedFlow<NoticeComposeResult>(extraBufferCapacity = 4, onBufferOverflow = BufferOverflow.DROP_OLDEST)

    /** Every list collects this to show the outcome and reload. */
    val changes: SharedFlow<NoticeComposeResult> = _changes.asSharedFlow()

    @Synchronized
    fun remember(notice: Notice) {
        opened[notice.id] = notice
    }

    @Synchronized
    fun opened(id: String): Notice? = opened[id]

    fun post(result: NoticeComposeResult, notice: Notice? = null) {
        notice?.let(::remember)
        _changes.tryEmit(result)
    }
}
