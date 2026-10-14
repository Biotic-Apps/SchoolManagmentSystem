package com.schoolapp.feature.meetings.domain

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.settings.PagedList

/** Server-paged meetings of one box (upcoming soonest first, past newest first). */
@Immutable
data class MeetingPage(
    val items: List<Meeting> = emptyList(),
    val page: Int = 0,
    val total: Int = 0,
    val isLoadingMore: Boolean = false,
    val loadMoreError: AppError? = null,
) {
    val hasMore: Boolean get() = page > 0 && items.size < total

    val canLoadMore: Boolean get() = hasMore && !isLoadingMore && loadMoreError == null

    /** First page replaces, later pages append (skipping rows already shown). */
    fun with(result: PagedList<Meeting>): MeetingPage {
        val first = result.page <= 1
        val known = if (first) emptySet() else items.map { it.id }.toSet()
        return MeetingPage(
            items = (if (first) emptyList() else items) + result.items.filterNot { it.id in known },
            page = result.page,
            total = result.total,
        )
    }

    companion object {
        const val PAGE_SIZE = 20
    }
}
