package com.schoolapp.feature.fees.staff.invoices

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.ui.fileJobMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.MonthStepper
import com.schoolapp.feature.fees.staff.structure.SheetFooter

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun GenerateInvoicesSheet(
    sheet: GenerateSheet,
    sessions: List<AcademicSession>,
    classes: List<SchoolClass>,
    onEdit: ((GenerateSheet) -> GenerateSheet) -> Unit,
    onRun: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !sheet.running
    AppBottomSheet(title = stringResource(R.string.fees_inv_generate), onDismiss = onDismiss) {
        Muted(stringResource(R.string.fees_inv_generate_help))
        CreatablePickerField(
            label = stringResource(R.string.fees_inv_session),
            options = sessions.map { PickerOption(it.id, it.name) },
            selectedId = sheet.sessionId,
            onSelect = { id -> onEdit { it.copy(sessionId = id) } },
            enabled = enabled,
            errorText = if (sheet.sessionMissing) stringResource(R.string.fees_inv_session_required) else null,
        )
        Label(stringResource(R.string.fees_inv_month))
        MonthStepper(sheet.month, { month -> onEdit { it.copy(month = month) } }, enabled = enabled)
        Label(stringResource(R.string.fees_inv_classes))
        Muted(stringResource(R.string.fees_inv_classes_hint))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            classes.forEach { schoolClass ->
                val on = schoolClass.id in sheet.classIds
                FilterChip(
                    selected = on,
                    enabled = enabled,
                    onClick = { onEdit { it.copy(classIds = if (on) it.classIds - schoolClass.id else it.classIds + schoolClass.id) } },
                    label = { Text(schoolClass.name) },
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = AppColors.Surface,
                        selectedContainerColor = AppColors.Selected,
                        selectedLabelColor = AppColors.Primary,
                    ),
                )
            }
        }
        if (sheet.running) InlineMessage(stringResource(R.string.fees_inv_generating), StatusTone.Info)
        SheetFooter(sheet.error, sheet.running, onRun, onDismiss, saveLabel = stringResource(R.string.fees_inv_generate))
    }
}

@Composable
internal fun PrintChallansSheet(
    sheet: PrintSheet,
    classes: List<SchoolClass>,
    onEdit: ((PrintSheet) -> PrintSheet) -> Unit,
    onClass: (String?) -> Unit,
    onRun: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !sheet.running
    AppBottomSheet(title = stringResource(R.string.fees_inv_print), onDismiss = onDismiss) {
        Muted(stringResource(R.string.fees_inv_print_help))
        Label(stringResource(R.string.fees_inv_month))
        MonthStepper(sheet.month, { month -> onEdit { it.copy(month = month) } }, enabled = enabled)
        CreatablePickerField(
            label = stringResource(R.string.fees_inv_class),
            options = classes.map { PickerOption(it.id, it.name) },
            selectedId = sheet.classId,
            onSelect = onClass,
            noneLabel = stringResource(R.string.fees_inv_all_classes),
            fallbackValue = stringResource(R.string.fees_inv_all_classes),
            enabled = enabled,
        )
        if (sheet.classId != null) {
            CreatablePickerField(
                label = stringResource(R.string.fees_inv_section),
                options = sheet.sections.map { PickerOption(it.id, it.name) },
                selectedId = sheet.sectionId,
                onSelect = { id -> onEdit { it.copy(sectionId = id) } },
                noneLabel = stringResource(R.string.fees_inv_all_sections),
                fallbackValue = stringResource(R.string.fees_inv_all_sections),
                enabled = enabled,
            )
        }
        if (sheet.running) InlineMessage(stringResource(R.string.fees_inv_printing), StatusTone.Info)
        sheet.error?.let { InlineMessage(fileJobMessage(it), StatusTone.Error) }
        SheetFooter(null, sheet.running, onRun, onDismiss, saveLabel = stringResource(R.string.fees_inv_print_start))
    }
}

@Composable
private fun Label(text: String) = Text(text, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)

@Composable
internal fun Muted(text: String) = Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
