package com.schoolapp.feature.exams.templates.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.templates.ReportCardTemplate
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.templates.TemplateForm

private val PAPERS = listOf(ReportCardTemplate.A4, ReportCardTemplate.LETTER)

/** Every field of the web template form: name, default, layout, header, sections, signatures, footer. */
@Composable
internal fun TemplateFormSheet(
    form: TemplateForm,
    onEdit: ((ReportCardTemplate) -> ReportCardTemplate) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    val t = form.template
    val title = stringResource(if (t.id.isBlank()) R.string.exams_templates_new_title else R.string.exams_templates_edit_title)
    AppBottomSheet(title = title, onDismiss = onDismiss) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        AppTextField(
            value = t.name,
            onValueChange = { v -> onEdit { it.copy(name = v.take(NAME_MAX)) } },
            label = stringResource(R.string.exams_templates_name),
            errorText = if (form.nameMissing) stringResource(R.string.exams_templates_name_required) else null,
        )
        SwitchRow(stringResource(R.string.exams_templates_is_default), t.isDefault, { v -> onEdit { it.copy(isDefault = v) } })
        SectionHeader(title = stringResource(R.string.exams_templates_layout))
        SegmentedChoice(
            labels = listOf(stringResource(R.string.exams_templates_portrait), stringResource(R.string.exams_templates_landscape)),
            selectedIndex = if (t.orientation == ReportCardTemplate.LANDSCAPE) 1 else 0,
            onSelect = { i -> onEdit { it.copy(orientation = if (i == 1) ReportCardTemplate.LANDSCAPE else ReportCardTemplate.PORTRAIT) } },
        )
        SegmentedChoice(
            labels = PAPERS,
            selectedIndex = PAPERS.indexOf(t.paperSize).coerceAtLeast(0),
            onSelect = { i -> onEdit { it.copy(paperSize = PAPERS[i]) } },
        )
        SectionHeader(title = stringResource(R.string.exams_templates_header))
        SwitchRow(stringResource(R.string.exams_templates_show_logo), t.showLogo, { v -> onEdit { it.copy(showLogo = v) } })
        TextInput(t.schoolName, R.string.exams_templates_school_name, TEXT_200) { v -> onEdit { it.copy(schoolName = v) } }
        TextInput(t.subtitle, R.string.exams_templates_subtitle, TEXT_300) { v -> onEdit { it.copy(subtitle = v) } }
        TextInput(t.address, R.string.exams_templates_address, TEXT_300) { v -> onEdit { it.copy(address = v) } }
        TextInput(t.phone, R.string.exams_templates_phone, PHONE_MAX) { v -> onEdit { it.copy(phone = v) } }
        SectionHeader(title = stringResource(R.string.exams_templates_sections))
        SwitchRow(stringResource(R.string.exams_templates_show_scale), t.showGradingScale, { v -> onEdit { it.copy(showGradingScale = v) } })
        SwitchRow(stringResource(R.string.exams_templates_show_skills), t.showSkills, { v -> onEdit { it.copy(showSkills = v) } })
        SwitchRow(stringResource(R.string.exams_templates_show_remarks), t.showRemarks, { v -> onEdit { it.copy(showRemarks = v) } })
        SwitchRow(stringResource(R.string.exams_templates_show_attendance), t.showAttendance, { v -> onEdit { it.copy(showAttendance = v) } })
        SwitchRow(stringResource(R.string.exams_templates_show_position), t.showPosition, { v -> onEdit { it.copy(showPosition = v) } })
        SignatureLines(t, onEdit)
        TextInput(t.footerText, R.string.exams_templates_footer, TEXT_300) { v -> onEdit { it.copy(footerText = v) } }
        PrimaryButton(stringResource(R.string.exams_templates_save), onSave, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}

@Composable
private fun SignatureLines(t: ReportCardTemplate, onEdit: ((ReportCardTemplate) -> ReportCardTemplate) -> Unit) {
    SectionHeader(title = stringResource(R.string.exams_templates_signatures))
    t.signatures.forEachIndexed { index, line ->
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextField(
                value = line,
                onValueChange = { v -> onEdit { it.copy(signatures = it.signatures.toMutableList().apply { set(index, v.take(SIGNATURE_MAX)) }) } },
                label = stringResource(R.string.exams_templates_signature, index + 1),
                modifier = Modifier.weight(1f),
            )
            IconButton(onClick = { onEdit { it.copy(signatures = it.signatures.filterIndexed { i, _ -> i != index }) } }) {
                Icon(Icons.Outlined.DeleteOutline, contentDescription = stringResource(R.string.exams_templates_remove_signature), tint = AppColors.Error)
            }
        }
    }
    if (t.signatures.size < SIGNATURES_MAX) {
        AppTextButton(stringResource(R.string.exams_templates_add_signature), { onEdit { it.copy(signatures = it.signatures + "") } }, leadingIcon = Icons.Outlined.Add)
    }
}

@Composable
private fun TextInput(value: String, label: Int, max: Int, onChange: (String) -> Unit) {
    AppTextField(value = value, onValueChange = { onChange(it.take(max)) }, label = stringResource(label))
}

private const val NAME_MAX = 100
private const val TEXT_200 = 200
private const val TEXT_300 = 300
private const val PHONE_MAX = 50
private const val SIGNATURE_MAX = 100
private const val SIGNATURES_MAX = 6
