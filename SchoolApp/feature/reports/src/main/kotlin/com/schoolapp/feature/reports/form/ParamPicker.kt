package com.schoolapp.feature.reports.form

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.model.reports.ReportParam
import com.schoolapp.core.model.reports.ReportParamType
import com.schoolapp.feature.reports.components.paramLabel
import java.time.LocalDate

/** The chooser for one picker param: option sheet for ids / months, date dialog for dates (no future days). */
@Composable
internal fun ParamPicker(
    param: ReportParam,
    state: ReportFormUiState,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val current = state.values[param.name].orEmpty()
    when (param.type) {
        ReportParamType.DATE -> {
            val today = remember { LocalDate.now().toString() }
            AppDatePickerDialog(
                initialDate = current.ifEmpty { today },
                onConfirm = onSelect,
                onDismiss = onDismiss,
                maxDate = today,
                minDate = if (param.name == TO) state.values[FROM]?.ifEmpty { null } else null,
            )
        }
        ReportParamType.MONTH -> OptionPickerSheet(
            title = paramLabel(param),
            options = remember { monthOptions() },
            selectedId = current,
            allowAll = !param.required,
            onSelect = onSelect,
            onDismiss = onDismiss,
        )
        ReportParamType.BRANCH, ReportParamType.SCHOOL, ReportParamType.EXAM -> OptionPickerSheet(
            title = paramLabel(param),
            options = state.optionsFor(param.type).options,
            selectedId = current,
            allowAll = !param.required,
            onSelect = onSelect,
            onDismiss = onDismiss,
        )
        // Typed in place; never opened as a picker.
        ReportParamType.NUMBER, ReportParamType.TEXT -> Unit
    }
}
