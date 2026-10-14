package com.schoolapp.feature.complaints.list

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintStatus

@Immutable
data class ComplaintsUiState(
    val tabs: List<ComplaintBox> = listOf(ComplaintBox.MINE),
    val box: ComplaintBox = ComplaintBox.MINE,
    /** Server filters. */
    val status: ComplaintStatus? = null,
    val category: ComplaintCategory? = null,
    /** Client-side filter over the loaded rows (ticket number or subject). */
    val search: String = "",
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val items: List<Complaint> = emptyList(),
    val page: Int = 0,
    val total: Int = 0,
    val isLoadingMore: Boolean = false,
    val loadMoreError: AppError? = null,
    val error: AppError? = null,
) {
    val hasMore: Boolean get() = page > 0 && items.size < total

    val isFiltered: Boolean get() = status != null || category != null || search.isNotBlank()

    val visibleItems: List<Complaint>
        get() {
            val term = search.trim().lowercase()
            if (term.isEmpty()) return items
            return items.filter { it.ticketNo.lowercase().contains(term) || it.subject.lowercase().contains(term) }
        }
}
