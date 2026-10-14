package com.schoolapp.feature.messages.threads

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.message.MessageThread
import java.time.LocalDate

@Immutable
data class ThreadsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isParent: Boolean = false,
    val myUserId: String? = null,
    /** Parent: the active child the list is filtered to. */
    val childId: String? = null,
    /** Principal, coordinator, head teacher (and super admin) may read every thread of the branch. */
    val canReadBranch: Boolean = false,
    /** Branch-wide, read-only view instead of the caller's own threads. */
    val branchScope: Boolean = false,
    val unreadOnly: Boolean = false,
    /** Client-side filter over the loaded threads (subject, student, last message, participants). */
    val search: String = "",
    val threads: List<MessageThread> = emptyList(),
    val page: Int = 0,
    val total: Int = 0,
    val isLoadingMore: Boolean = false,
    val loadMoreError: AppError? = null,
    val error: AppError? = null,
    val today: LocalDate = LocalDate.MIN,
) {
    val hasMore: Boolean get() = page > 0 && threads.size < total

    val isFiltered: Boolean get() = search.isNotBlank() || unreadOnly

    val visibleThreads: List<MessageThread>
        get() {
            val term = search.trim().lowercase()
            if (term.isEmpty()) return threads
            return threads.filter { it.matches(term) }
        }
}

private fun MessageThread.matches(term: String): Boolean =
    (listOf(subject, studentName, lastMessageBody, lastSenderName) + participants.map { it.name })
        .any { it?.lowercase()?.contains(term) == true }
