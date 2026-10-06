package com.schoolapp.feature.exams.board

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetStatus

/** Sheets of one class-section (e.g. "Class 5-A"). */
@Immutable
data class SectionSheets(val sectionId: String, val label: String, val sheets: List<MarkSheet>)

@Immutable
data class CompletenessCounts(val accepted: Int = 0, val submitted: Int = 0, val draft: Int = 0, val notEntered: Int = 0)

@Immutable
data class CompletenessUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val exams: List<Exam> = emptyList(),
    val selectedExamId: String? = null,
    val sheets: List<MarkSheet> = emptyList(),
    val sheetsLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val sheetsError: AppError? = null,
    /** null = all statuses. */
    val filter: MarkSheetStatus? = null,
    val canEdit: Boolean = false,
    val canApprove: Boolean = false,
) {
    /** Submitted counts sheets waiting for a decision (incl. probation review); draft includes returned sheets. */
    val counts: CompletenessCounts
        get() = CompletenessCounts(
            accepted = sheets.count { it.status == MarkSheetStatus.ACCEPTED },
            submitted = sheets.count { it.status == MarkSheetStatus.SUBMITTED || it.status == MarkSheetStatus.PENDING_REVIEW },
            draft = sheets.count { it.status == MarkSheetStatus.DRAFT || it.status == MarkSheetStatus.RETURNED },
            notEntered = sheets.count { it.status == MarkSheetStatus.NOT_ENTERED },
        )

    /** Statuses present in this exam, for the filter chips. */
    val statuses: List<Pair<MarkSheetStatus, Int>>
        get() = MarkSheetStatus.entries.map { status -> status to sheets.count { it.status == status } }.filter { it.second > 0 }

    val groups: List<SectionSheets>
        get() = sheets.filter { filter == null || it.status == filter }
            .groupBy { it.sectionId }
            .map { (sectionId, items) ->
                val first = items.first()
                SectionSheets(sectionId, "${first.className}-${first.sectionName}", items.sortedBy { it.subjectName })
            }
            .sortedBy { it.label }
}
