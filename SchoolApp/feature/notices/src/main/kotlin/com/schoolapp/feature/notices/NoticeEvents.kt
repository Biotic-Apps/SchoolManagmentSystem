package com.schoolapp.feature.notices

import com.schoolapp.core.model.notice.Notice
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

enum class NoticeComposeResult { PUBLISHED, SENT_FOR_APPROVAL }

/** Feature-wide hand-offs: the notice opened from the feed (so detail needs no refetch) and the compose outcome. */
@Singleton
class NoticeEvents @Inject constructor() {
    private val opened = mutableMapOf<String, Notice>()
    private val _composeResult = MutableStateFlow<NoticeComposeResult?>(null)
    val composeResult: StateFlow<NoticeComposeResult?> = _composeResult.asStateFlow()

    @Synchronized
    fun remember(notice: Notice) {
        opened[notice.id] = notice
    }

    @Synchronized
    fun opened(id: String): Notice? = opened[id]

    fun postComposeResult(result: NoticeComposeResult) {
        _composeResult.value = result
    }

    fun consumeComposeResult() {
        _composeResult.value = null
    }
}
