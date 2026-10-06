package com.schoolapp.feature.complaints.list

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintBox

@Immutable
data class ComplaintsUiState(
    val tabs: List<ComplaintBox> = listOf(ComplaintBox.MINE),
    val box: ComplaintBox = ComplaintBox.MINE,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val items: List<Complaint> = emptyList(),
    val error: AppError? = null,
)
