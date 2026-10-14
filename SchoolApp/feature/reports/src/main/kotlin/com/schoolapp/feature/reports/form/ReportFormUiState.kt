package com.schoolapp.feature.reports.form

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportFormat
import com.schoolapp.core.model.reports.ReportParamType

/** Why a field is not accepted; shown inline under it. */
enum class FieldError { REQUIRED, BAD_DATE, BAD_MONTH, BAD_NUMBER, END_BEFORE_START }

/** Choices for one picker param (branch / school / exam), with their own loading and error. */
@Immutable
data class ParamOptions(
    val options: List<SwitcherOption> = emptyList(),
    val isLoading: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class ReportFormUiState(
    val report: Report? = null,
    /** Param name to raw value (`YYYY-MM-DD`, `YYYY-MM`, ids, digits). */
    val values: Map<String, String> = emptyMap(),
    val format: ReportFormat = ReportFormat.PDF,
    val errors: Map<String, FieldError> = emptyMap(),
    val options: Map<ReportParamType, ParamOptions> = emptyMap(),
    val isSubmitting: Boolean = false,
    val submitError: AppError? = null,
    /** Set once the export is queued; the host closes the sheet and confirms. */
    val queuedJobId: String? = null,
) {
    fun optionsFor(type: ReportParamType): ParamOptions = options[type] ?: ParamOptions()
}
