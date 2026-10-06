package com.schoolapp.feature.complaints.file

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.files.Attachment

@Immutable
data class FileComplaintUiState(
    val isParent: Boolean = false,
    val children: List<ChildSummary> = emptyList(),
    /** Parent only; null = not about a specific child. */
    val childId: String? = null,
    val category: ComplaintCategory? = null,
    val subject: String = "",
    val description: String = "",
    val anonymous: Boolean = false,
    val attachments: List<Attachment> = emptyList(),
    val uploadingCount: Int = 0,
    val categoryMissing: Boolean = false,
    val subjectMissing: Boolean = false,
    val descriptionMissing: Boolean = false,
    val isSubmitting: Boolean = false,
    val error: AppError? = null,
    /** Set once filed; the route opens the detail and clears it. */
    val filedId: String? = null,
)
