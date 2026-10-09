package com.schoolapp.feature.exams.sheets

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.MarkSheet

/** A section of the teacher's sheets, for its behaviour & skills ratings. */
@Immutable
data class SheetSection(val sectionId: String, val label: String)

/** Sheets of one exam, in list order. */
@Immutable
data class ExamSheetGroup(val examId: String, val examName: String, val sheets: List<MarkSheet>) {
    val sections: List<SheetSection>
        get() = sheets.distinctBy { it.sectionId }.map { SheetSection(it.sectionId, "${it.className}-${it.sectionName}") }
}

@Immutable
data class MySheetsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val groups: List<ExamSheetGroup> = emptyList(),
)
