package com.schoolapp.feature.notices.paging

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.settings.PagedList

/** A server-paged notice list: first load, pull-to-refresh and load-more on scroll. */
@Immutable
data class NoticePage(
    val items: List<Notice> = emptyList(),
    val page: Int = 0,
    val total: Int = 0,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val error: AppError? = null,
    val loadMoreError: AppError? = null,
) {
    val hasMore: Boolean get() = page > 0 && items.size < total

    fun starting(refresh: Boolean): NoticePage =
        copy(isLoading = !refresh || items.isEmpty(), isRefreshing = refresh && items.isNotEmpty(), error = null, loadMoreError = null)

    fun firstPage(result: PagedList<Notice>): NoticePage =
        NoticePage(items = result.items, page = 1, total = result.total, isLoading = false)

    fun nextPage(result: PagedList<Notice>): NoticePage = copy(
        items = (items + result.items).distinctBy { it.id },
        page = result.page,
        total = result.total,
        isLoadingMore = false,
    )

    fun failed(error: AppError): NoticePage = copy(isLoading = false, isRefreshing = false, error = error)

    fun replace(notice: Notice): NoticePage = copy(items = items.map { if (it.id == notice.id) notice else it })
}
